import { ROUND_DATA, TECH_COEFS_ROUND, EconomyItem } from "../../lib/constants";

export const getCrossSectionArea = (profileType: "round" | "hex", size_mm: number): number => {
  if (profileType === "round") {
    return (Math.PI * Math.pow(size_mm, 2)) / 4;
  } else {
    // Hex area: (sqrt(3) / 2) * size^2
    return (Math.sqrt(3) / 2) * Math.pow(size_mm, 2);
  }
};

export const calculateBarWeightKg = (profileType: "round" | "hex", size_mm: number, length_mm: number): number => {
  const area = getCrossSectionArea(profileType, size_mm);
  // Density of steel = 0.00000785 kg/mm^3
  return area * length_mm * 0.00000785;
};

export const calculateDrawCoefficient = (
  profileType: "round" | "hex",
  target: number,
  raw: number,
  activeData: any[]
): number => {
  const match = activeData.find(
    (item) => item.target === target && item.raw === raw
  );
  if (match) return match.coef;

  // Fallback: Area ratio
  if (profileType === "round") {
    return Math.pow(raw / target, 2);
  } else {
    // Hex-to-Hex ratio is same as diameter ratio squared
    return Math.pow(raw / target, 2);
  }
};

export const getTechnicalCoefficients = (
  profileType: "round" | "hex",
  target: number,
  raw: number
): { front: number; back: number } => {
  if (profileType === "round") {
    const key = `${target}_${raw}`;
    if (TECH_COEFS_ROUND[key]) {
      return { front: TECH_COEFS_ROUND[key][0], back: TECH_COEFS_ROUND[key][1] };
    } else if (target > 50) {
      let fCoef = 1.032;
      if (target > 50 && target <= 54) fCoef = 1.033;
      else if (target > 54 && target <= 58) fCoef = 1.034;
      else if (target > 58) fCoef = 1.035;
      return { front: fCoef, back: 1.003 };
    }
    return { front: 1.027, back: 1.003 };
  }
  return { front: 1.030, back: 1.003 };
};

export const calculateRequiredWeightTons = (
  orderWeightTons: number,
  piecesPerBar: number,
  orderedLengthMm: number,
  displayedTargetLengthMm: number
) => {
  if (!displayedTargetLengthMm || piecesPerBar === 0) return null;
  const usefulLength = orderedLengthMm * piecesPerBar;
  const drawLength = displayedTargetLengthMm;
  if (drawLength === 0) return orderWeightTons;
  
  const kim = usefulLength / drawLength;
  return orderWeightTons / (kim > 0 ? kim : 1);
};

export const calculateOptimalBilletLengths = (
  orderedLengthMm: number,
  currentDrawCoef: number,
  totalTechCoef: number,
  isND: boolean
) => {
  const draw = currentDrawCoef;
  const tech = totalTechCoef;
  const options = [];

  const maxBillet = Math.floor(8400 / draw);
  const maxAllowedBillet = Math.min(6000, maxBillet);

  if (isND) {
    for (let b = 4000; b <= maxAllowedBillet; b += 100) {
      const estUseful = (b * draw) / tech;
      let bestScrapForB = 999999;
      let bestN = 0;
      for (let i = 1; i <= 20; i++) {
        const optLen = Math.floor(estUseful / i) - 5;
        if (optLen >= 3000 && optLen <= 6000) {
          const scrap = estUseful - i * optLen;
          if (scrap < bestScrapForB && scrap >= 0) {
            bestScrapForB = scrap;
            bestN = i;
          }
        }
      }
      if (bestN > 0) {
        options.push({ billetLength: b, n: bestN, actualUseful: estUseful, scrap: bestScrapForB });
      }
    }
  } else {
    for (let n = 1; n <= 60; n++) {
      const idealBillet = (n * orderedLengthMm * tech) / draw;
      const roundedBillet = Math.ceil(idealBillet / 100) * 100;
      if (roundedBillet >= 4000 && roundedBillet <= maxAllowedBillet) {
        const estUseful = (roundedBillet * draw) / tech;
        const scrap = estUseful - n * orderedLengthMm;
        if (scrap >= 0) {
          options.push({ billetLength: roundedBillet, n, actualUseful: estUseful, scrap });
        }
      }
    }
  }

  const uniqueOptions = Array.from(
    new Map(options.map((item) => [item.billetLength, item])).values(),
  );

  return uniqueOptions.sort((a, b) => a.scrap - b.scrap).slice(0, 3);
};

export interface CommercialStats {
  lossesPerTon: number;
  scrapRevenuePerTon: number;
  netLossesPerTon: number;
  directEconomyCostsPerTon: number;
  overheadEconomyCostsPerTon: number;
  totalProcessingCostsPerTon: number;
  totalCostsPerTon: number;
  profitPerTon: number;
  profitTotal: number;
  marginPercent: number;
  sellTotal: number;
  sellTotalVat: number;
  rawTotal: number;
  lossesTotal: number;
  scrapRevenueTotal: number;
  netLossesTotal: number;
  isPositive: boolean;
  economyData: any[];
}

export const calculateCommercialStats = (
  sellPrice: number,
  rawPrice: number,
  orderWeight: number,
  economyItems: EconomyItem[],
  advancedRemnantStats: any
): CommercialStats | null => {
  if (!sellPrice || !rawPrice || !orderWeight) return null;

  const economyData = economyItems.map((item) => {
    let costPerTon = 0;
    if (item.type === "variable") {
      costPerTon = Number(item.norm) || 0;
    } else {
      costPerTon = ((Number(item.quantity) || 0) * (Number(item.price) || 0)) / orderWeight;
    }
    return { ...item, costPerTon };
  });

  const directEconomyCostsPerTon = economyData
    .filter((i) => i.category === "direct")
    .reduce((acc, curr) => acc + curr.costPerTon, 0);
  const overheadEconomyCostsPerTon = economyData
    .filter((i) => i.category === "overhead")
    .reduce((acc, curr) => acc + curr.costPerTon, 0);

  const totalProcessingCostsPerTon = directEconomyCostsPerTon + overheadEconomyCostsPerTon;

  const lossesPerTon = advancedRemnantStats?.valuePerTon ? Number(advancedRemnantStats.valuePerTon) : 0;
  const scrapRevenuePerTon = advancedRemnantStats?.revenuePerTon ? Number(advancedRemnantStats.revenuePerTon) : 0;
  const netLossesPerTon = lossesPerTon - scrapRevenuePerTon;

  const totalCostsPerTon = rawPrice + totalProcessingCostsPerTon + netLossesPerTon;
  const profitPerTon = sellPrice - totalCostsPerTon;
  const profitTotal = profitPerTon * orderWeight;
  const marginPercent = sellPrice > 0 ? (profitPerTon / sellPrice) * 100 : 0;

  return {
    lossesPerTon,
    scrapRevenuePerTon,
    netLossesPerTon,
    directEconomyCostsPerTon,
    overheadEconomyCostsPerTon,
    totalProcessingCostsPerTon,
    totalCostsPerTon,
    profitPerTon,
    profitTotal,
    marginPercent,
    sellTotal: sellPrice * orderWeight,
    sellTotalVat: sellPrice * orderWeight * 1.2, // Assuming 20% VAT
    rawTotal: rawPrice * orderWeight,
    lossesTotal: lossesPerTon * orderWeight,
    scrapRevenueTotal: advancedRemnantStats?.orderRevenue || 0,
    netLossesTotal: netLossesPerTon * orderWeight,
    economyData,
    isPositive: profitTotal >= 0,
  };
};

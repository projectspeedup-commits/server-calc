import React from "react";
import { TrendingUp, BarChart3, PieChart, AlertCircle, Info, Wallet } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatCurrency } from "../../lib/constants";
import { CommercialStats } from "../../utils/math/calculatorCore";

interface EconomyDisplayProps {
  commercialStats: CommercialStats | null;
  sellPrice: string;
  setSellPrice: (val: string) => void;
  validationErrors: Record<string, string>;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

export function EconomyDisplay({
  commercialStats,
  sellPrice,
  setSellPrice,
  validationErrors,
  isExpanded,
  setIsExpanded,
}: EconomyDisplayProps) {
  if (!commercialStats) {
    return (
      <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 text-center space-y-3" id="economy-placeholder">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-blue-800 font-medium">Введите цену продажи и параметры заказа для расчета экономики</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="economy-display-container">
      {/* Sell Price Input */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm space-y-4" id="sell-price-section">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            Цена продажи (руб/тн без НДС)
          </label>
          {validationErrors.sellPrice && (
            <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Ошибка
            </span>
          )}
        </div>
        <input
          id="sell-price-input"
          type="text"
          inputMode="numeric"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value.replace(/\s/g, "").replace(/,/g, "."))}
          placeholder="0.00"
          className={cn(
            "w-full p-4 rounded-xl border-2 text-2xl font-bold tracking-tight transition-all outline-none",
            validationErrors.sellPrice ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50"
          )}
        />
      </div>

      {/* Main Results Bar */}
      <div 
        id="profit-summary-bar"
        className={cn(
          "rounded-2xl p-6 shadow-md transition-all duration-300",
          commercialStats.isPositive 
            ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white" 
            : "bg-gradient-to-br from-red-600 to-rose-700 text-white"
        )}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Чистая прибыль</p>
            <h3 className="text-3xl font-black tabular-nums">
              {formatCurrency(commercialStats.profitTotal)} <span className="text-xl font-normal opacity-80">₽</span>
            </h3>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 px-3 text-right">
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-tight">Маржа</p>
            <p className="text-lg font-black">{commercialStats.marginPercent.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-white/70 text-[10px] font-bold uppercase mb-1">Выручка (без НДС)</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(commercialStats.sellTotal)} ₽</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-[10px] font-bold uppercase mb-1">Затраты (полные)</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(commercialStats.totalCostsPerTon * (commercialStats.sellTotal/Number(sellPrice)))} ₽</p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <button 
        id="economy-details-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium cursor-pointer"
      >
        {isExpanded ? "Скрыть детализацию" : "Показать детализацию затрат"}
        <Info className={cn("w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")} />
      </button>

      {isExpanded && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-inner space-y-6" id="economy-details-panel">
          {/* Costs Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              Структура затрат (на 1 тонну)
            </h4>
            
            <div className="space-y-3" id="costs-structure">
              {[
                { label: "Сырье и материалы", val: Number(commercialStats.rawTotal / (commercialStats.sellTotal/Number(sellPrice))), color: "bg-blue-500" },
                { label: "Потери (торцовка + обрезь)", val: commercialStats.netLossesPerTon, color: "bg-orange-500" },
                { label: "Прямые произв. расходы", val: commercialStats.directEconomyCostsPerTon, color: "bg-emerald-500" },
                { label: "Общехозяйственные", val: commercialStats.overheadEconomyCostsPerTon, color: "bg-purple-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className={cn("w-2 h-2 rounded-full", item.color)} />
                    {item.label}
                  </div>
                  <span className="font-mono font-bold text-gray-800">{formatCurrency(item.val)}</span>
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between items-center text-sm font-black text-gray-900 uppercase">
                <span>Итого себестоимость</span>
                <span className="font-mono">{formatCurrency(commercialStats.totalCostsPerTon)}</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Доходы от отходов
            </h4>
            <div className="grid grid-cols-2 gap-3" id="waste-revenue">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Выручка за обрезь</p>
                <p className="text-lg font-black text-gray-800">{formatCurrency(commercialStats.scrapRevenuePerTon)} <span className="text-xs font-normal">₽/тн</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Всего по заказу</p>
                <p className="text-lg font-black text-gray-800">{formatCurrency(commercialStats.scrapRevenueTotal)} <span className="text-xs font-normal">₽</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

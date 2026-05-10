import {
  DEFAULT_RAW_PRICES,
  sanitizeKey,
  DEFAULT_ECONOMY_ITEMS,
  DEFAULT_STEEL_GRADES,
} from "./lib/constants";
import { useStore } from "./store";
import { useEffect, useState, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import { AdminPanel } from "./components/AdminPanel";
import { CalculatorApp } from "./components/CalculatorApp";
import { LoginScreen } from "./components/LoginScreen";
import { PrintTemplate } from "./components/PrintTemplate";
import { motion, AnimatePresence } from "motion/react";
import { fetchSettings, saveSettingsToLocal } from "./services/apiService";

export default function App() {
  const [view, setView] = useState<
    "login" | "manager" | "admin" | "purchasing"
  >("login");
  const [user, setUser] = useState<any>(null);
  const [isCloudActive, setIsCloudActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("arsenal_theme");
      return (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("arsenal_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("arsenal_theme", "light");
    }
  }, [isDarkMode]);

  // Global state from Zustand
  const {
    globalRawPrices,
    setGlobalRawPrices,
    globalScrapPrice,
    setGlobalScrapPrice,
    globalRemnantPrice,
    setGlobalRemnantPrice,
    customGrades,
    setCustomGrades,
    deletedGrades,
    setDeletedGrades,
    remnantPricing,
    setRemnantPricing,
    economyItems,
    setEconomyItems,
    isUserSettingsLoaded,
    setIsUserSettingsLoaded,
  } = useStore();
  
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          setIsCloudActive(true);
          setConnectionError(null);
        } else {
          setIsCloudActive(false);
          setConnectionError("Сервер вернул ошибку");
        }
      } catch (e) {
        setIsCloudActive(false);
        setConnectionError("Сервер не доступен. Убедитесь, что запущена команда 'npm run dev'");
      } finally {
        setIsConnecting(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10s

    // Restore local user session
    const savedUser = window.localStorage.getItem("arsenal_local_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser({ uid: "local-user-" + Math.random().toString(36).substring(7) });
      }
    } else {
      setUser({ uid: "local-user-" + Math.random().toString(36).substring(7) });
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedRaw = window.localStorage.getItem("arsenal_raw_prices");
        const savedScrap = window.localStorage.getItem("arsenal_scrap_price");
        const savedRemnant = window.localStorage.getItem(
          "arsenal_remnant_price",
        );
        const savedCustomGrades = window.localStorage.getItem(
          "arsenal_custom_grades",
        );
        const savedDeletedGrades = window.localStorage.getItem(
          "arsenal_deleted_grades",
        );
        const savedRemnantPricing = window.localStorage.getItem(
          "arsenal_remnant_pricing",
        );
        const savedEconomy = window.localStorage.getItem(
          "arsenal_economy_items",
        );

        let loadedCustomGrades: string[] = [];
        try {
          if (savedCustomGrades) {
            loadedCustomGrades = JSON.parse(savedCustomGrades);
            setCustomGrades(loadedCustomGrades);
          }
        } catch (e) {
          window.localStorage.removeItem("arsenal_custom_grades");
        }

        let loadedDeletedGrades: string[] = [];
        try {
          if (savedDeletedGrades) {
            loadedDeletedGrades = JSON.parse(savedDeletedGrades);
            setDeletedGrades(loadedDeletedGrades);
          }
        } catch (e) {
          window.localStorage.removeItem("arsenal_deleted_grades");
        }

        try {
          if (savedRemnantPricing) {
            setRemnantPricing(JSON.parse(savedRemnantPricing));
          }
        } catch (e) {
          window.localStorage.removeItem("arsenal_remnant_pricing");
        }

        try {
          if (savedEconomy) {
            const parsed = JSON.parse(savedEconomy);
            const initialMap = new Map(
              parsed.map((item: any) => [item.id, item]),
            );
            setEconomyItems(
              DEFAULT_ECONOMY_ITEMS.map(
                (defaultItem) => initialMap.get(defaultItem.id) || defaultItem,
              ),
            );
          }
        } catch (e) {
          window.localStorage.removeItem("arsenal_economy_items");
        }

        try {
          if (savedRaw) {
            const parsed = JSON.parse(savedRaw);
            const loadedPrices = { ...DEFAULT_RAW_PRICES };
            const allG = [
              ...Object.keys(DEFAULT_RAW_PRICES),
              ...loadedCustomGrades,
            ];
            allG.forEach((grade) => {
              if (parsed[grade] !== undefined) {
                if (typeof parsed[grade] === "string") {
                  loadedPrices[grade] = {
                    md: parsed[grade],
                    nd: parsed[grade],
                  };
                } else {
                  loadedPrices[grade] = parsed[grade];
                }
              }
            });
            setGlobalRawPrices(loadedPrices);
          }
        } catch (e) {
          window.localStorage.removeItem("arsenal_raw_prices");
        }
        if (savedScrap) setGlobalScrapPrice(savedScrap);
        if (savedRemnant) setGlobalRemnantPrice(savedRemnant);
      }
    } catch (e) {}

    isInitialLoad.current = false;

    const loadData = async () => {
      try {
        const data = await fetchSettings("prices");
        if (data) {
          const storeState = useStore.getState();
          const resultingCustomGrades = data.customGrades || storeState.customGrades;
          setCustomGrades(resultingCustomGrades);
          
          const resultingDeletedGrades = data.deletedGrades || storeState.deletedGrades;
          setDeletedGrades(resultingDeletedGrades);

          if (data.rawPrices || data.rawPricesV2) {
            const loadedPrices = { ...DEFAULT_RAW_PRICES };
            const allG = [...Object.keys(DEFAULT_RAW_PRICES), ...resultingCustomGrades];
            allG.forEach((grade) => {
              const dbKey = sanitizeKey(grade);
              const valObj = data.rawPricesV2 ? data.rawPricesV2[dbKey] : undefined;
              const valString = data.rawPrices ? data.rawPrices[dbKey] : undefined;

              if (valObj && valObj.md !== undefined) {
                loadedPrices[grade] = valObj;
              } else if (typeof valString === "string") {
                loadedPrices[grade] = { md: valString, nd: valString };
              }
            });
            setGlobalRawPrices(loadedPrices);
          }

          if (data.remnantPricing) setRemnantPricing(data.remnantPricing);
          if (data.economyItems) {
            const initialMap = new Map(data.economyItems.map((item: any) => [item.id, item]));
            const merged = DEFAULT_ECONOMY_ITEMS.map((defaultItem) => initialMap.get(defaultItem.id) || defaultItem);
            setEconomyItems(merged);
          }
          if (data.scrapPrice !== undefined) setGlobalScrapPrice(data.scrapPrice);
          if (data.remnantPrice !== undefined) setGlobalRemnantPrice(data.remnantPrice);
        }
      } catch (error) {
        console.warn("Ошибка загрузки настроек сервера:", error);
      } finally {
        setIsUserSettingsLoaded(true);
      }
    };

    if (isCloudActive && user) {
      loadData();
    }
  }, [user, isCloudActive]);

  const handleAnonymousLogin = async (targetView: "manager" | "purchasing" | "admin") => {
    setView(targetView);
  };

  const handleSaveGlobal = async (
    rawPricesObj: Record<string, { md: string; nd: string }>,
    scrapStr: string,
    remnantStr: string,
    cGrades: string[],
    rPricing: Record<string, { round: string; hex: string }>,
    eItems?: any[],
    dGrades?: string[],
  ) => {
    setGlobalRawPrices(rawPricesObj);
    setGlobalScrapPrice(scrapStr);
    setGlobalRemnantPrice(remnantStr);
    if (cGrades) setCustomGrades(cGrades);
    if (dGrades) setDeletedGrades(dGrades);
    if (rPricing) setRemnantPricing(rPricing);
    if (eItems) setEconomyItems(eItems);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "arsenal_raw_prices",
          JSON.stringify(rawPricesObj),
        );
        window.localStorage.setItem("arsenal_scrap_price", scrapStr);
        window.localStorage.setItem("arsenal_remnant_price", remnantStr);
        if (cGrades)
          window.localStorage.setItem(
            "arsenal_custom_grades",
            JSON.stringify(cGrades),
          );
        if (dGrades)
          window.localStorage.setItem(
            "arsenal_deleted_grades",
            JSON.stringify(dGrades),
          );
        if (rPricing)
          window.localStorage.setItem(
            "arsenal_remnant_pricing",
            JSON.stringify(rPricing),
          );
        if (eItems)
          window.localStorage.setItem(
            "arsenal_economy_items",
            JSON.stringify(eItems),
          );
      }
    } catch (e) {}

    if (isCloudActive && user) {
      const firestoreRawPricesV2: Record<string, { md: string; nd: string }> = {};
      const firestoreRawPricesOld: Record<string, string> = {};

      for (const [k, v] of Object.entries(rawPricesObj)) {
        const sanitized = sanitizeKey(k);
        firestoreRawPricesV2[sanitized] = v;
        firestoreRawPricesOld[sanitized] = v.nd || v.md || "0";
      }

      const payload: any = {
        rawPrices: firestoreRawPricesOld,
        rawPricesV2: firestoreRawPricesV2,
        scrapPrice: scrapStr,
        remnantPrice: remnantStr,
        updatedAt: new Date().toISOString(),
      };
      if (cGrades) payload.customGrades = cGrades;
      if (dGrades) payload.deletedGrades = dGrades;
      if (rPricing) payload.remnantPricing = rPricing;
      if (eItems) payload.economyItems = eItems;

      try {
        await saveSettingsToLocal("prices", payload);
      } catch (error) {
        console.error("Failed to save to local server:", error);
      }
    }
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  return (
    <>
      {printData && (
        <PrintTemplate
          reportData={printData.reportData}
          orderWeight={printData.orderWeight}
          selectedTarget={printData.selectedTarget}
          printText={printData.reportText}
        />
      )}
      <div className="min-h-screen overflow-x-hidden bg-[#F0F4F4] dark:bg-[#111310] flex flex-col font-sans print:hidden">
        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <LoginScreen
                onManagerLogin={() => handleAnonymousLogin("manager")}
                onPurchasingLogin={() => handleAnonymousLogin("purchasing")}
                onAdminLogin={(adminUser) => {
                  setUser(adminUser);
                  setView("admin");
                }}
                user={user}
                isCloudActive={isCloudActive}
                isConnecting={isConnecting}
                connectionError={connectionError}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
              />
            </motion.div>
          )}

          {view === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
                <AdminPanel
                  initialRawPrices={globalRawPrices}
                  initialScrap={globalScrapPrice}
                  initialRemnant={globalRemnantPrice}
                  initialCustomGrades={customGrades}
                  initialDeletedGrades={deletedGrades}
                  initialRemnantPricing={remnantPricing}
                  initialEconomyItems={economyItems}
                  onSave={handleSaveGlobal}
                  onLogout={() => {
                    setUser(null);
                    setView("login");
                  }}
                  isCloudActive={isCloudActive}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  user={user}
                />
              </div>
            </motion.div>
          )}

          {view === "purchasing" && (
            <motion.div
              key="purchasing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
                <AdminPanel
                  initialRawPrices={globalRawPrices}
                  initialScrap={globalScrapPrice}
                  initialRemnant={globalRemnantPrice}
                  initialCustomGrades={customGrades}
                  initialDeletedGrades={deletedGrades}
                  initialRemnantPricing={remnantPricing}
                  initialEconomyItems={economyItems}
                  onSave={handleSaveGlobal}
                  onLogout={() => {
                    setUser(null);
                    setView("login");
                  }}
                  isCloudActive={isCloudActive}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  initialTab="production"
                  isPurchasingMode={true}
                  user={user}
                />
              </div>
            </motion.div>
          )}

          {view === "manager" && (
            <motion.div
              key="manager"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
                <CalculatorApp
                  adminRawPrices={globalRawPrices}
                  adminScrapPrice={globalScrapPrice}
                  adminRemnantPrice={globalRemnantPrice}
                  customGrades={customGrades}
                  deletedGrades={deletedGrades}
                  remnantPricing={remnantPricing}
                  economyItems={economyItems}
                  onLogout={() => setView("login")}
                  isCloudActive={isCloudActive}
                  user={user}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  onAdminSwitch={() => setView("login")}
                  onPrintDataUpdate={setPrintData}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

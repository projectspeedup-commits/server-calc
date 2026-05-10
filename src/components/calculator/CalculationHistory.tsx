import React from "react";
import { History, Trash2, ArrowRight, Calendar, Ruler, Package } from "lucide-react";
import { formatCurrency } from "../../lib/constants";
import { cn } from "../../lib/utils";

interface CalculationHistoryProps {
  savedCalculations: any[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onLoad: (calc: any) => void;
  isCloudActive: boolean;
}

export function CalculationHistory({
  savedCalculations,
  onDelete,
  onClear,
  onLoad,
  isCloudActive,
}: CalculationHistoryProps) {
  if (savedCalculations.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center" id="history-empty">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-gray-300 shadow-sm border border-gray-100 mb-4">
          <History className="w-8 h-8" />
        </div>
        <h4 className="text-gray-900 font-bold mb-1">История расчетов пуста</h4>
        <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Сохраненные расчеты появятся здесь для быстрого доступа</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="history-container">
      <div className="flex items-center justify-between px-2" id="history-header">
        <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          Последние расчеты
        </h3>
        <button
          id="clear-history-button"
          onClick={onClear}
          className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg cursor-pointer"
        >
          Очистить всё
        </button>
      </div>

      <div className="space-y-3" id="history-list">
        {savedCalculations.map((calc, idx) => (
          <div
            key={calc.id || idx}
            id={`history-item-${calc.id || idx}`}
            className="group relative bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
            onClick={() => onLoad(calc)}
          >
            {/* Header: Grade & Profile */}
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                  {calc.profileType === "round" ? "Круг" : "Шест."}
                </span>
                <h4 className="font-black text-gray-900 text-lg leading-tight uppercase">{calc.steelGrade}</h4>
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {calc.createdAt?.toDate ? calc.createdAt.toDate().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Неизвестно"}
                </p>
              </div>
              
              <button
                id={`delete-calc-${calc.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(calc.id);
                }}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Sizes Info */}
            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-400 font-black uppercase">Размеры</p>
                <div className="flex items-center gap-2 font-mono font-bold text-gray-800">
                  <span>{calc.selectedRaw}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-500" />
                  <span>{calc.selectedTarget}</span>
                  <span className="text-[10px] text-gray-400 font-normal">мм</span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] text-gray-400 font-black uppercase">Масса</p>
                <div className="flex items-center justify-end gap-1 font-mono font-bold text-gray-800">
                  <span>{calc.orderWeight}</span>
                  <span className="text-[10px] text-gray-400 font-normal">тн</span>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 font-black uppercase">Цена продажи</span>
                  <span className="text-sm font-black text-gray-900 tabular-nums">{formatCurrency(calc.sellPrice)} ₽</span>
                </div>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!isCloudActive && (
        <div className="bg-amber-50 border-2 border-amber-100 rounded-xl p-4 flex gap-3 items-start" id="offline-warning">
          <div className="bg-amber-100 p-1 rounded-md text-amber-600">
            <Package className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">Локальное хранение</p>
            <p className="text-xs text-amber-700/80 leading-relaxed">Данные хранятся в памяти браузера, так как облачная синхронизация не настроена.</p>
          </div>
        </div>
      )}
    </div>
  );
}

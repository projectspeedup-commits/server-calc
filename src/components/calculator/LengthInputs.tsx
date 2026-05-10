import React from "react";
import { Ruler, Package, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import { handleNumericInput, formatInputValue } from "../../lib/constants";

interface LengthInputsProps {
  orderWeight: string;
  setOrderWeight: (val: string) => void;
  lengthInput: { value: string; source: "raw" | "target" };
  setLengthInput: (val: { value: string; source: "raw" | "target" }) => void;
  orderedLength: string;
  setOrderedLength: (val: string) => void;
  validationErrors: Record<string, string>;
}

export function LengthInputs({
  orderWeight,
  setOrderWeight,
  lengthInput,
  setLengthInput,
  orderedLength,
  setOrderedLength,
  validationErrors,
}: LengthInputsProps) {
  return (
    <div className="space-y-6" id="length-inputs-container">
      {/* Order Volume */}
      <div className="space-y-2" id="order-volume-section">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 px-1">
          <Package className="w-4 h-4 text-emerald-600" />
          Объем заказа (тонн)
        </label>
        <div className="relative group">
          <input
            id="order-weight-input"
            type="text"
            inputMode="decimal"
            value={formatInputValue(orderWeight)}
            onChange={(e) => handleNumericInput(e, setOrderWeight)}
            placeholder="0.000"
            className={cn(
              "w-full p-4 pl-5 rounded-xl border-2 text-xl font-semibold transition-all outline-none h-16 group-hover:border-gray-300 focus:ring-2 focus:ring-emerald-500",
              validationErrors.orderWeight ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
            )}
          />
        </div>
        {validationErrors.orderWeight && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 px-1">
            <AlertTriangle className="w-3 h-3" />
            {validationErrors.orderWeight}
          </p>
        )}
      </div>

      {/* Billet Length */}
      <div className="space-y-2" id="billet-length-section">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 px-1">
          <Ruler className="w-4 h-4 text-blue-600" />
          Длина заготовки (мм)
        </label>
        <div className="relative group">
          <input
            id="billet-length-input"
            type="text"
            inputMode="numeric"
            value={lengthInput.value}
            onChange={(e) => handleNumericInput(e, (v) => setLengthInput({ ...lengthInput, value: v }))}
            placeholder="6000"
            className={cn(
              "w-full p-4 rounded-xl border-2 text-xl font-semibold transition-all outline-none h-16 group-hover:border-gray-300 focus:ring-2 focus:ring-blue-500",
              validationErrors.rawLength ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
            )}
          />
        </div>
        {validationErrors.rawLength && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 px-1">
            <AlertTriangle className="w-3 h-3" />
            {validationErrors.rawLength}
          </p>
        )}
      </div>

      {/* Target Piece Length */}
      <div className="space-y-2" id="target-length-section">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 px-1">
          <span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded text-[10px] font-bold text-gray-600">L</span>
          Длина готовой детали (мм)
        </label>
        <div className="grid grid-cols-4 gap-2" id="target-length-grid">
          <input
            id="target-length-input"
            type="text"
            className={cn(
              "col-span-3 p-4 rounded-xl border-2 text-xl font-semibold transition-all outline-none h-16 focus:ring-2 focus:ring-gray-400",
              validationErrors.orderedLength ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
            )}
            value={orderedLength}
            onChange={(e) => setOrderedLength(e.target.value)}
            placeholder="6000 или НД"
          />
          <button
            id="toggle-nd-button"
            onClick={() => setOrderedLength(orderedLength === "НД" ? "6000" : "НД")}
            className={cn(
              "rounded-xl border-2 font-bold text-xs uppercase transition-all whitespace-nowrap px-1 cursor-pointer",
              orderedLength === "НД"
                ? "bg-gray-800 border-gray-800 text-white shadow-md"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
            )}
          >
            НД
          </button>
        </div>
        {validationErrors.orderedLength && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 px-1">
            <AlertTriangle className="w-3 h-3" />
            {validationErrors.orderedLength}
          </p>
        )}
      </div>
    </div>
  );
}

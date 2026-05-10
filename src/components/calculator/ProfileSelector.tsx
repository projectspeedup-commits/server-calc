import React from "react";
import { Circle, Hexagon, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  DEFAULT_STEEL_GRADES,
  getGostForGrade,
  getProfileGost,
} from "../../lib/constants";

interface ProfileSelectorProps {
  profileType: "round" | "hex";
  setProfileType: (type: "round" | "hex") => void;
  steelGrade: string;
  setSteelGrade: (grade: string) => void;
  allGrades: string[];
  selectedTarget: string;
  setSelectedTarget: (val: string) => void;
  targetOptions: number[];
  selectedRaw: string;
  setSelectedRaw: (val: string) => void;
  rawOptions: number[];
  validationErrors: Record<string, string>;
}

export function ProfileSelector({
  profileType,
  setProfileType,
  steelGrade,
  setSteelGrade,
  allGrades,
  selectedTarget,
  setSelectedTarget,
  targetOptions,
  selectedRaw,
  setSelectedRaw,
  rawOptions,
  validationErrors,
}: ProfileSelectorProps) {
  return (
    <div className="space-y-6" id="profile-selector-container">
      {/* Profile Type Toggle */}
      <div className="grid grid-cols-2 gap-3" id="profile-type-toggle">
        <button
          id="toggle-round"
          onClick={() => setProfileType("round")}
          className={cn(
            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer h-16",
            profileType === "round"
              ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
              : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
          )}
        >
          <Circle className={cn("w-5 h-5", profileType === "round" ? "fill-emerald-500" : "")} />
          <span className="font-semibold text-lg">Круг</span>
        </button>
        <button
          id="toggle-hex"
          onClick={() => setProfileType("hex")}
          className={cn(
            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer h-16",
            profileType === "hex"
              ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm"
              : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
          )}
        >
          <Hexagon className={cn("w-5 h-5", profileType === "hex" ? "fill-amber-500" : "")} />
          <span className="font-semibold text-lg">Шестигранник</span>
        </button>
      </div>

      {/* Steel Grade Selection */}
      <div className="space-y-2" id="steel-grade-section">
        <label className="text-sm font-medium text-gray-700 flex justify-between items-center px-1">
          <span>Марка стали</span>
          {steelGrade && (
            <span className="text-[10px] font-mono text-gray-400">
              {getGostForGrade(steelGrade)}
            </span>
          )}
        </label>
        <select
          id="steel-grade-select"
          value={steelGrade}
          onChange={(e) => setSteelGrade(e.target.value)}
          className={cn(
            "w-full p-4 rounded-xl border-2 bg-white text-lg focus:ring-2 focus:ring-emerald-500 transition-all outline-none h-16 appearance-none cursor-pointer",
            validationErrors.steelGrade ? "border-red-500" : "border-gray-200"
          )}
        >
          <option value="">Выберите марку...</option>
          {allGrades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        {validationErrors.steelGrade && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1 px-1">
            <AlertTriangle className="w-3 h-3" />
            {validationErrors.steelGrade}
          </p>
        )}
      </div>

      {/* Dimensions Grid */}
      <div className="grid grid-cols-2 gap-4" id="dimensions-grid">
        <div className="space-y-2" id="target-dimension-section">
          <label className="text-sm font-medium text-gray-700 px-1">
            Размер (мм)
          </label>
          <select
            id="target-size-select"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-lg focus:ring-2 focus:ring-emerald-500 transition-all outline-none h-16 appearance-none cursor-pointer"
          >
            <option value="">Готовый...</option>
            {targetOptions.map((t) => (
              <option key={t} value={t}>
                {t} мм
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400 px-1 font-mono uppercase">
            {getProfileGost(profileType)}
          </p>
        </div>

        <div className="space-y-2" id="raw-dimension-section">
          <label className="text-sm font-medium text-gray-700 px-1">
            Заготовка (мм)
          </label>
          <select
            id="raw-size-select"
            value={selectedRaw}
            onChange={(e) => setSelectedRaw(e.target.value)}
            disabled={!selectedTarget}
            className={cn(
              "w-full p-4 rounded-xl border-2 bg-white text-lg focus:ring-2 focus:ring-emerald-500 transition-all outline-none h-16 appearance-none",
              !selectedTarget ? "bg-gray-50 border-gray-100 cursor-not-allowed" : "border-gray-200 cursor-pointer"
            )}
          >
            <option value="">Сырье...</option>
            {rawOptions.map((r) => (
              <option key={r} value={r}>
                {r} мм
              </option>
            ))}
          </select>
          {validationErrors.dimensions && (
            <p className="text-[10px] text-red-500 mt-1 px-1">{validationErrors.dimensions}</p>
          )}
        </div>
      </div>
    </div>
  );
}

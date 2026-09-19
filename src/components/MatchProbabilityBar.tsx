import React from 'react';

interface MatchProbabilityBarProps {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  homeName: string;
  awayName: string;
  compact?: boolean;
}

export const MatchProbabilityBar: React.FC<MatchProbabilityBarProps> = ({
  homeProb,
  drawProb,
  awayProb,
  homeName,
  awayName,
  compact = false,
}) => {
  return (
    <div className="w-full space-y-1.5 font-mono tabular-nums">
      {!compact && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8]">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {homeName} {homeProb}%
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Empate {drawProb}%
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {awayName} {awayProb}%
          </span>
        </div>
      )}

      {/* Bar container */}
      <div className={`flex w-full overflow-hidden rounded-md border border-slate-200 dark:border-[#252D3A] bg-slate-100 dark:bg-[#10151F] ${compact ? 'h-2' : 'h-3'}`}>
        <div
          style={{ width: `${Math.max(4, homeProb)}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`${homeName}: ${homeProb}%`}
        />
        <div
          style={{ width: `${Math.max(4, drawProb)}%` }}
          className="bg-slate-400 dark:bg-slate-600 transition-all duration-500"
          title={`Empate: ${drawProb}%`}
        />
        <div
          style={{ width: `${Math.max(4, awayProb)}%` }}
          className="bg-blue-500 transition-all duration-500"
          title={`${awayName}: ${awayProb}%`}
        />
      </div>

      {compact && (
        <div className="flex justify-between text-[10px] text-slate-600 dark:text-[#94A3B8] font-mono tabular-nums">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{homeProb}%</span>
          <span className="text-slate-600 dark:text-slate-400">{drawProb}%</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{awayProb}%</span>
        </div>
      )}
    </div>
  );
};

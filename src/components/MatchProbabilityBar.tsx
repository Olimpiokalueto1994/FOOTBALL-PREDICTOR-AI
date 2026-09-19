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
    <div className="w-full space-y-1.5 font-mono">
      {!compact && (
        <div className="flex items-center justify-between text-xs text-[#8D98A8]">
          <span className="font-semibold text-emerald-400">
            {homeName} {homeProb}%
          </span>
          <span className="text-zinc-400">
            Empate {drawProb}%
          </span>
          <span className="font-semibold text-blue-400">
            {awayName} {awayProb}%
          </span>
        </div>
      )}

      {/* Bar container */}
      <div className={`flex w-full overflow-hidden rounded-md border border-[#252D3A] bg-[#10151F] ${compact ? 'h-2' : 'h-3'}`}>
        <div
          style={{ width: `${Math.max(4, homeProb)}%` }}
          className="bg-emerald-500/90 transition-all duration-500"
          title={`${homeName}: ${homeProb}%`}
        />
        <div
          style={{ width: `${Math.max(4, drawProb)}%` }}
          className="bg-zinc-600 transition-all duration-500"
          title={`Empate: ${drawProb}%`}
        />
        <div
          style={{ width: `${Math.max(4, awayProb)}%` }}
          className="bg-blue-500/90 transition-all duration-500"
          title={`${awayName}: ${awayProb}%`}
        />
      </div>

      {compact && (
        <div className="flex justify-between text-[10px] text-[#8D98A8]">
          <span className="text-emerald-400">{homeProb}%</span>
          <span className="text-zinc-400">{drawProb}%</span>
          <span className="text-blue-400">{awayProb}%</span>
        </div>
      )}
    </div>
  );
};

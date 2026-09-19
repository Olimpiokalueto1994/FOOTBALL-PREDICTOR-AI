import React from 'react';

interface TeamCrestProps {
  teamName: string;
  shortName?: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamCrest: React.FC<TeamCrestProps> = ({
  teamName,
  shortName = '',
  logoUrl,
  size = 'md',
  className = '',
}) => {
  const nameLower = (teamName + ' ' + shortName).toLowerCase();

  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-sm',
    xl: 'h-16 w-16 text-base',
  }[size];

  // If official crest image URL is provided (e.g. from football-data.org)
  if (logoUrl) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/80 shadow-2xs overflow-hidden ${sizeClasses} ${className}`}
        title={teamName}
      >
        <img 
          src={logoUrl} 
          alt={teamName} 
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Specific Club Shield Designs with Authentic Colors & Emblems
  if (nameLower.includes('arsenal')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#EF0107] text-white shadow-xs border-2 border-[#9C824A] ${sizeClasses} ${className}`}
        title="Arsenal FC"
      >
        <div className="flex flex-col items-center justify-center font-bold font-sans">
          <span className="font-extrabold text-[11px] tracking-tight">AFC</span>
          <div className="h-1 w-4 bg-[#9C824A] rounded-full mt-0.5" />
        </div>
      </div>
    );
  }

  if (nameLower.includes('chelsea')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#034694] text-white shadow-xs border-2 border-[#DBA111] ${sizeClasses} ${className}`}
        title="Chelsea FC"
      >
        <div className="flex flex-col items-center justify-center font-bold font-sans">
          <span className="font-extrabold text-[11px] tracking-tight text-[#DBA111]">CFC</span>
          <div className="h-1 w-4 bg-white rounded-full mt-0.5" />
        </div>
      </div>
    );
  }

  if (nameLower.includes('manchester city') || nameLower.includes('man city') || nameLower.includes('city')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#6CABDD] text-[#1C2C5B] shadow-xs border-2 border-[#1C2C5B] ${sizeClasses} ${className}`}
        title="Manchester City"
      >
        <div className="flex flex-col items-center justify-center font-bold font-sans">
          <span className="font-extrabold text-[10px] tracking-tight text-[#1C2C5B]">MCFC</span>
          <div className="h-1 w-4 bg-[#1C2C5B] rounded-full mt-0.5" />
        </div>
      </div>
    );
  }

  if (nameLower.includes('liverpool')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#C8102E] text-white shadow-xs border-2 border-[#00B2A9] ${sizeClasses} ${className}`}
        title="Liverpool FC"
      >
        <div className="flex flex-col items-center justify-center font-bold font-sans">
          <span className="font-extrabold text-[11px] tracking-tight">LFC</span>
          <div className="h-1 w-4 bg-[#F6EB61] rounded-full mt-0.5" />
        </div>
      </div>
    );
  }

  if (nameLower.includes('real madrid') || nameLower.includes('madrid')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-white text-[#1E3A8A] shadow-xs border-2 border-[#EEA83B] ${sizeClasses} ${className}`}
        title="Real Madrid"
      >
        <div className="flex flex-col items-center justify-center font-bold font-sans">
          <span className="text-[#EEA83B] text-[8px] font-black leading-none">👑</span>
          <span className="font-extrabold text-[10px] tracking-tight text-[#1E3A8A]">RMCF</span>
        </div>
      </div>
    );
  }

  if (nameLower.includes('barcelona') || nameLower.includes('barça')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-gradient-to-r from-[#004D98] to-[#A50044] text-[#EDBB00] shadow-xs border-2 border-[#EDBB00] ${sizeClasses} ${className}`}
        title="FC Barcelona"
      >
        <span className="font-extrabold text-[10px] tracking-tight text-[#EDBB00]">FCB</span>
      </div>
    );
  }

  if (nameLower.includes('bayern')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#DC052D] text-white shadow-xs border-2 border-[#0066B2] ${sizeClasses} ${className}`}
        title="FC Bayern München"
      >
        <span className="font-extrabold text-[10px] tracking-tight text-white">FCB</span>
      </div>
    );
  }

  if (nameLower.includes('paris') || nameLower.includes('psg')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#004170] text-white shadow-xs border-2 border-[#DA291C] ${sizeClasses} ${className}`}
        title="Paris Saint-Germain"
      >
        <span className="font-extrabold text-[10px] tracking-tight text-white">PSG</span>
      </div>
    );
  }

  if (nameLower.includes('benfica')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#E30613] text-white shadow-xs border-2 border-[#BFA15F] ${sizeClasses} ${className}`}
        title="SL Benfica"
      >
        <span className="font-extrabold text-[10px] tracking-tight text-white">SLB</span>
      </div>
    );
  }

  if (nameLower.includes('sporting')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#008057] text-white shadow-xs border-2 border-[#E7C352] ${sizeClasses} ${className}`}
        title="Sporting CP"
      >
        <span className="font-extrabold text-[10px] tracking-tight text-[#E7C352]">SCP</span>
      </div>
    );
  }

  if (nameLower.includes('inter')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-[#001489] text-white shadow-xs border-2 border-[#000000] ${sizeClasses} ${className}`}
        title="Inter de Milão"
      >
        <span className="font-extrabold text-[10px] tracking-tight text-white">IM</span>
      </div>
    );
  }

  if (nameLower.includes('juventus') || nameLower.includes('juve')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full bg-black text-white shadow-xs border-2 border-white ${sizeClasses} ${className}`}
        title="Juventus"
      >
        <span className="font-extrabold text-[12px] tracking-tight text-white">J</span>
      </div>
    );
  }

  // Fallback: Clean Monogram Badge with Team Initials
  const initials = (shortName || teamName)
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 3)
    .join('')
    .toUpperCase();

  return (
    <div 
      className={`relative flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#1A2333] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold font-mono shadow-2xs ${sizeClasses} ${className}`}
      title={teamName}
    >
      <span>{initials}</span>
    </div>
  );
};

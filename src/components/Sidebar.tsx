import React from 'react';
import { 
  Home,
  CalendarDays, 
  BarChart3, 
  History, 
  Trophy,
  Star,
  Settings, 
  Brain,
  ShieldCheck, 
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

export type NavTabId = 'matches' | 'search' | 'performance' | 'history' | 'admin' | 'leagues' | 'favorites';

interface SidebarProps {
  currentTab: NavTabId;
  setCurrentTab: (tab: NavTabId) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenMethodology: () => void;
  isSyntheticData?: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  todayMatchesCount?: number;
  favoritesCount?: number;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onOpenMethodology,
  isSyntheticData = true,
  collapsed,
  onToggleCollapse,
  todayMatchesCount = 12,
  favoritesCount = 5,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'matches',
      label: 'Início',
      icon: Home,
    },
    {
      id: 'matches',
      label: 'Jogos de Hoje',
      icon: CalendarDays,
      badge: todayMatchesCount,
    },
    {
      id: 'performance',
      label: 'Análise & Estatísticas',
      icon: BarChart3,
    },
    {
      id: 'history',
      label: 'Histórico de Previsões',
      icon: History,
    },
    {
      id: 'leagues',
      label: 'Campeonatos',
      icon: Trophy,
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Star,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'admin',
      label: 'Configurações',
      icon: Settings,
    },
  ];

  return (
    <aside 
      id="app-sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-[#1E2638] bg-[#0A101D] text-white transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section: Logo + Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none">
        {/* Brand Header */}
        <div className={`flex h-16 items-center border-b border-[#1A2234] px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div 
            onClick={() => setCurrentTab('matches')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            {/* Stylized Logo Icon (Red / Blue / White FP Badge matching reference screenshot) */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md ring-1 ring-white/20">
              <svg viewBox="0 0 32 32" className="h-5 w-5 fill-none" xmlns="http://www.w3.org/2000/svg">
                {/* Red accent curve */}
                <path d="M7 8C7 6.89543 7.89543 6 9 6H20C22.2091 6 24 7.79086 24 10C24 12.2091 22.2091 14 20 14H12V18H18C19.6569 18 21 19.3431 21 21C21 22.6569 19.6569 24 18 24H9C7.89543 24 7 23.1046 7 22V8Z" fill="#F43F5E" />
                {/* White / Blue foreground P */}
                <path d="M10 9C10 8.44772 10.4477 8 11 8H18C19.6569 8 21 9.34315 21 11C21 12.6569 19.6569 14 18 14H13V23H10V9Z" fill="#FFFFFF" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
            </div>

            {/* Brand Text (shown when expanded) */}
            {!collapsed && (
              <div className="flex flex-col text-left leading-none transition-opacity duration-200">
                <span className="font-sans font-bold text-base tracking-tight text-white">
                  Football <span className="text-blue-400">Predictor</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-1">
                  PROBABILISTIC CORE
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle button on desktop header */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#151C2C] hover:text-white transition-colors"
              title="Recolher barra lateral"
              aria-label="Recolher barra lateral"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation items list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            // Differentiate between 'Início' and 'Jogos de Hoje' if both map to matches
            const isHome = item.label === 'Início' && currentTab === 'matches';
            const isMatches = item.label === 'Jogos de Hoje' && currentTab === 'matches';
            const isActive = item.id === currentTab && (item.label !== 'Jogos de Hoje' || isMatches);

            return (
              <div key={`${item.id}-${index}`} className="relative group">
                <button
                  id={`sidebar-nav-${item.id}-${index}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    collapsed ? 'justify-center' : 'justify-between'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                      : 'text-slate-300 hover:bg-[#141B2B] hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {/* Badges (e.g. 12 on Jogos de Hoje) */}
                  {!collapsed && item.badge !== undefined && (
                    <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-mono font-bold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip when collapsed */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden group-hover:flex items-center rounded-md bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs font-medium text-white shadow-xl whitespace-nowrap">
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-1.5 rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px] text-blue-300 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: AI & Status Box matching screenshot */}
      <div className="p-3 border-t border-[#1A2234]">
        {!collapsed ? (
          <div className="rounded-xl border border-[#1E2638] bg-[#0E1524] p-3.5 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Brain className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                IA + Dados Reais
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Análises baseadas em estatísticas, tendências, lesões e muito mais.
            </p>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="h-0.5 w-8 bg-rose-500 rounded-full mb-1.5" />
              <p className="text-[10px] font-medium text-slate-400">
                Mais que palpites, <span className="text-white font-semibold">são dados.</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-x-0 space-y-2">
            <button
              onClick={onToggleCollapse}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#141B2B] transition-colors"
              title="Expandir barra lateral"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Minimal methodology & status link */}
        {!collapsed && (
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <button
              onClick={onOpenMethodology}
              className="flex items-center space-x-1.5 hover:text-blue-400 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Transparência</span>
            </button>
            <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online</span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

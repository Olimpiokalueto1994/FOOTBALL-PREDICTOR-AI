import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Menu,
  Sparkles,
  User,
  Settings,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface AppHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileMenu: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearchSubmit: (term: string) => void;
  onOpenTransparencyModal?: () => void;
  userName?: string;
  userRole?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
  theme,
  toggleTheme,
  searchTerm,
  setSearchTerm,
  onSearchSubmit,
  onOpenTransparencyModal,
  userName = 'Olimpio Kalueto',
  userRole = 'Analista de Futebol',
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    }
  };

  return (
    <header 
      id="main-app-header"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-[#1E2638] bg-white/95 dark:bg-[#0B101D]/95 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200"
    >
      {/* Left side: Toggle button + Search input */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151C2C] transition-colors"
          title="Abrir menu"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151C2C] transition-colors"
          title={sidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          aria-label={sidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        {/* Search Bar matching screenshot */}
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            id="header-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar jogos, times ou campeonatos..."
            className="w-full rounded-full border border-slate-200 dark:border-[#20293D] bg-slate-50 dark:bg-[#101726] py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#141C2E] focus:outline-none transition-all shadow-2xs"
          />
          {searchTerm.trim() !== '' && (
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-[11px] font-medium transition-colors flex items-center space-x-1"
            >
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          )}
        </form>
      </div>

      {/* Right side: Notifications, Theme Toggle, Profile */}
      <div ref={dropdownRef} className="flex items-center space-x-3 sm:space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151C2C] transition-colors"
            title="Notificações"
            aria-label="Ver notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0B101D]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-[#20293D] bg-white dark:bg-[#101726] p-3 shadow-xl z-50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <span className="font-semibold text-slate-900 dark:text-white">Notificações</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">1 nova</span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2 border border-blue-100 dark:border-blue-900/40">
                  <p className="font-medium text-slate-800 dark:text-slate-200">Arsenal vs Chelsea</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Previsões atualizadas com calibração Dixon-Coles às 15:30.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button (Light/Dark Mode) */}
        <button
          id="btn-header-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          aria-label={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-[#20293D] bg-slate-100 dark:bg-[#121826] text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-[#1A2337] transition-all shadow-2xs"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 transition-transform hover:rotate-45 duration-200" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12 duration-200" />
          )}
        </button>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile Info with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-[#151C2C] transition-colors"
          >
            {/* Avatar image */}
            <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-blue-500/20 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold text-xs">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                alt={userName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute">OK</span>
            </div>

            {/* Name and Role */}
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                {userName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {userRole}
              </span>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-[#20293D] bg-white dark:bg-[#101726] p-1.5 shadow-xl z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">olimpiokalueto@gmail.com</p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onOpenTransparencyModal) onOpenTransparencyModal();
                  }}
                  className="w-full flex items-center space-x-2 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#151C2C] transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                  <span>Metodologia & Fórmulas</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    toggleTheme();
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#151C2C] transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
                    <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{theme}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  SmilePlus,
  Activity,
  Sparkles,
  CalendarHeart,
  Wind,
  User,
  ShieldAlert,
  HelpCircle,
  Brain,
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCrisis: () => void;
  onOpenWayfinder: () => void;
  userProfile: UserProfile;
  hasUncheckedToday: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenCrisis,
  onOpenWayfinder,
  hasUncheckedToday,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'checkin',
      label: 'Check-In',
      icon: <SmilePlus className="w-5 h-5" />,
      badge: hasUncheckedToday ? 'Today' : undefined,
    },
    {
      id: 'pulse',
      label: 'My Pulse',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: 'patterns',
      label: 'Your Patterns',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'counseling',
      label: 'Counseling',
      icon: <CalendarHeart className="w-5 h-5" />,
    },
    {
      id: 'exercises',
      label: 'Micro-Breaks',
      icon: <Wind className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Settings',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 p-6 select-none bg-white border-r border-[#EAEAEA]"
      >
        <div className="flex flex-col h-full">
          {/* App Header / Brand */}
          <div className="flex flex-col items-center justify-center gap-3 px-2 mb-10 text-center">
            <img src="/logo.png" alt="ManoVeda Logo" className="w-32 h-auto object-contain" />
            <div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-outfit font-extrabold text-xl text-slate-900 tracking-tight">ManoVeda</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Wellness Space</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 block">
              Menu
            </span>

            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-[#325343] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white/90' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#325343]/10 text-[#325343]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 pt-6">
            {/* Guide Link */}
            <button
              onClick={onOpenWayfinder}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Not sure what you need?</span>
            </button>

            {/* Urgent Support / Get Help Now Button */}
            <button
              onClick={onOpenCrisis}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 font-semibold text-xs transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Get Help Now</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-[#EAEAEA] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ManoVeda Logo" className="w-24 h-auto object-contain" />
          <span className="font-outfit font-extrabold text-lg text-slate-900 tracking-tight">ManoVeda</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWayfinder}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-50"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenCrisis}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1.5 border border-red-100"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Help
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#EAEAEA] px-2 py-2 flex items-center justify-around shadow-lg pb-safe"
      >
        {navItems.slice(0, 5).map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                isActive ? 'text-[#325343] font-semibold' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
            activeTab === 'profile' ? 'text-[#325343] font-semibold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </nav>
    </>
  );
};

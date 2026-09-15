import React from 'react';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Printer, 
  ScanLine, 
  BarChart3, 
  Sparkles,
  BookOpenCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  examCount: number;
  scannedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  examCount,
  scannedCount
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exams' as ActiveTab, label: 'Manajemen Ujian', icon: FileSpreadsheet, badge: examCount },
    { id: 'print' as ActiveTab, label: 'Cetak LJK', icon: Printer },
    { id: 'scan' as ActiveTab, label: 'Scan & Koreksi', icon: ScanLine, highlight: true },
    { id: 'results' as ActiveTab, label: 'Rekap & Nilai', icon: BarChart3, badge: scannedCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg leading-tight">
                  Pemeriksa LJK
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> OMR & AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Sistem Pemindaian & Koreksi Otomatis</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50/80 shadow-xs'
                      : item.highlight
                      ? 'text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Scan Action CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('scan')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200"
            >
              <ScanLine className="w-4 h-4" />
              <span className="hidden sm:inline">Mulai Scan LJK</span>
              <span className="sm:hidden">Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav scrollbar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200/80 bg-white px-2 py-1.5 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

import React from 'react';
import { 
  Users, 
  CreditCard, 
  LayoutDashboard, 
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    { id: 'pegawai', name: 'Data Guru', icon: Users, description: 'Kelola data guru & gaji pokok' },
    { id: 'pembayaran', name: 'Pembayaran', icon: CreditCard, description: 'TPG, Tukin, & Daftar Nominatif' },
    { id: 'referensi', name: 'Referensi', icon: Sliders, description: 'Tabel golongan, Grade Tukin & PPh 21' },
  ];

  return (
    <aside 
      className={`bg-white/5 backdrop-blur-xl text-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-white/10 h-screen sticky top-0 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Upper Brand Section */}
      <div>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-emerald-500 rounded-lg text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col select-none transition-all duration-300">
                <span className="font-bold text-lg tracking-tight leading-none text-white">
                  TPG & TUKIN
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 tracking-wider uppercase font-bold">
                  Guru Kemenag
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 px-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors hidden md:block cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all duration-200 group relative cursor-pointer ${
                  isActive 
                    ? 'bg-white/10 text-white font-semibold border-white/10 shadow-lg shadow-white/5' 
                    : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <div className="flex items-center justify-center shrink-0">
                  <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-205'}`} />
                </div>
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm tracking-wide font-medium">{item.name}</span>
                    <span className="text-[10px] opacity-70 leading-none truncate group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </span>
                  </div>
                )}
                
                {/* Minimalist active dot indicator for collapsed state */}
                {collapsed && isActive && (
                  <div className="absolute right-1 w-1.5 h-6 bg-emerald-500 rounded-l-md" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}

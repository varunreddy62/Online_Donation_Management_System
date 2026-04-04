import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, PieChart, HeartHandshake, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/donors', label: 'Donors', icon: Users },
  { path: '/donations', label: 'Donations', icon: CreditCard },
  { path: '/analytics', label: 'Analytics', icon: PieChart },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  return (
    <aside className="w-64 bg-primary h-screen flex flex-col fixed inset-y-0 left-0 shadow-lg">
      <div className="h-16 flex items-center px-6 border-b border-white/15">
        <HeartHandshake className="w-8 h-8 text-white mr-3" />
        <span className="text-xl font-bold text-white tracking-wide">CharityCore</span>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              clsx(
                "flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300",
                isActive 
                  ? "bg-secondary text-dark shadow-sm" 
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/15">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-dark font-bold shadow-sm uppercase">
              {user?.name?.substring(0, 2) || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-white/60 truncate">{user?.email || 'admin@charity.org'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full border border-white/20 hover:bg-white/10 transition flex items-center justify-center text-sm font-medium rounded-lg text-white py-2"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

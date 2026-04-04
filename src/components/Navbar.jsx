import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-primary flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 w-[28rem] focus-within:ring-2 focus-within:ring-white/30 transition-all duration-200">
        <Search className="w-4 h-4 text-white/70 mr-3" />
        <input 
          type="text" 
          placeholder="Search donors, recent transactions..." 
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-white/60"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2.5 bg-white/10 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}

import React from 'react';
import { Home, Grid, ShoppingBag, Package, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toBengaliNumber } from '../utils/formatters';

export type NavTab = 'home' | 'categories' | 'cart' | 'orders' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { totalItems } = useCart();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'categories', label: 'ক্যাটাগরি', icon: Grid },
    { id: 'cart', label: 'কার্ট', icon: ShoppingBag, badge: totalItems },
    { id: 'orders', label: 'অর্ডার', icon: Package },
    { id: 'profile', label: 'প্রোফাইল', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5 sm:py-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-teal-600' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white font-bold text-[10px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-0.5 border border-white">
                    {toBengaliNumber(item.badge)}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

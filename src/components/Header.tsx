import React from 'react';
import { ShoppingBag, Search, PhoneCall, User as UserIcon, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StoreSettings } from '../types';
import { toBengaliNumber } from '../utils/formatters';

interface HeaderProps {
  settings: StoreSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onNavigateTab: (tab: 'home' | 'categories' | 'cart' | 'orders' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onOpenCart,
  onNavigateTab
}) => {
  const { totalItems } = useCart();
  const { currentUser, userProfile } = useAuth();
  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    setLogoError(false);
  }, [settings.logo]);

  const hasValidLogo = Boolean(settings.logo && settings.logo.trim() && !logoError);

  return (
    <header className="sticky top-0 z-40 bg-teal-600 text-white shadow-md">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          {hasValidLogo && (
            <img
              src={settings.logo}
              alt={settings.shopName || 'লোগো'}
              onError={() => setLogoError(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white/40 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform"
            />
          )}
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              {settings.shopName || 'আল-আমিন মার্কেটপ্লেস'}
            </h1>
            <span className="text-[11px] text-teal-100 hidden sm:inline-block font-normal">
              আপনার বিশ্বস্ত অনলাইন শপ
            </span>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct phone call button */}
          {settings.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="hidden md:flex items-center gap-1.5 bg-teal-700/70 hover:bg-teal-700 px-3 py-1.5 rounded-full text-xs font-medium text-teal-50 transition border border-teal-500/30"
              title="যোগাযোগ করুন"
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-200" />
              <span>{settings.phone}</span>
            </a>
          )}

          {/* User button */}
          {currentUser ? (
            <button
              onClick={() => onNavigateTab('profile')}
              className="flex items-center gap-1.5 bg-teal-700/60 hover:bg-teal-700 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition border border-teal-500/40"
            >
              <div className="w-5 h-5 rounded-full bg-teal-200 text-teal-800 font-bold flex items-center justify-center text-xs">
                {(userProfile?.name || currentUser.displayName || 'গ')[0]}
              </div>
              <span className="max-w-[80px] sm:max-w-[120px] truncate text-xs">
                {userProfile?.name || currentUser.displayName || 'প্রোফাইল'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-white text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <UserIcon className="w-4 h-4" />
              <span>লগইন</span>
            </button>
          )}

          {/* Cart Icon Button */}
          <button
            onClick={onOpenCart}
            aria-label="শপিং কার্ট"
            className="relative p-2 bg-teal-700/80 hover:bg-teal-700 rounded-xl transition text-white"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-teal-950 font-bold text-[11px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 shadow-md border-2 border-teal-600 animate-in zoom-in-75">
                {toBengaliNumber(totalItems)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-2.5 sm:pb-3">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পণ্য খুঁজুন (যেমন: জামা, ঘড়ি, তেল, মসলা...)"
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm pl-10 pr-9 py-2.5 rounded-xl border border-teal-400/40 focus:outline-hidden focus:ring-2 focus:ring-amber-300 focus:border-transparent shadow-xs transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

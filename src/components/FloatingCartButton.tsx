import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, toBengaliNumber } from '../utils/formatters';

interface FloatingCartButtonProps {
  onOpen: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onOpen }) => {
  const { totalItems, subtotal } = useCart();

  if (totalItems === 0) return null;

  return (
    <aside aria-label="ভাসমান কার্ট শর্টকাট" className="fixed bottom-20 right-4 z-30">
      <button
        onClick={onOpen}
        aria-label={`কার্টে যান, মোট ${toBengaliNumber(totalItems)}টি পণ্য`}
        className="flex items-center gap-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-4 py-3 rounded-full shadow-xl shadow-teal-700/30 border-2 border-white transition-all animate-in slide-in-from-bottom-5 duration-300"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-white" />
          <span className="absolute -top-2 -right-2 bg-amber-400 text-teal-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {toBengaliNumber(totalItems)}
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-teal-100 font-medium leading-none">কার্ট দেখুন</span>
          <span className="text-xs font-bold leading-tight">{formatPrice(subtotal)}</span>
        </div>
      </button>
    </aside>
  );
};

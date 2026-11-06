import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, toBengaliNumber, calculateDiscount } from '../utils/formatters';
import { ImageWithFallback } from './ImageWithFallback';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const discountPercent = calculateDiscount(product.price, product.oldPrice);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative w-full pt-[95%] bg-slate-50 overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-xs">
            {toBengaliNumber(discountPercent)}% ছাড়
          </div>
        )}

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-xs text-rose-300 font-semibold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-xs">
            স্টক শেষ
          </div>
        ) : product.stock <= 5 ? (
          <div className="absolute top-2 right-2 bg-amber-500 text-white font-medium text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
            মাত্র {toBengaliNumber(product.stock)}টি বাকি
          </div>
        ) : null}

        {/* Quick View Floating Hint */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-teal-600" /> বিস্তারিত দেখুন
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category tag */}
          <span className="text-[10px] sm:text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mb-1">
            {product.category || 'পণ্য'}
          </span>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Action Button */}
        <div className="pt-1 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 mb-2.5 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-teal-700">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs sm:text-sm text-slate-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isOutOfStock ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

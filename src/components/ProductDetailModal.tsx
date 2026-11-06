import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Check, AlertCircle, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, toBengaliNumber, calculateDiscount } from '../utils/formatters';
import { ImageWithFallback } from './ImageWithFallback';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectCheckout?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectCheckout
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const discountPercent = calculateDiscount(product.price, product.oldPrice);
  const maxAvailable = product.stock;

  const handleIncrement = () => {
    if (quantity < maxAvailable) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) {
      onClose();
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity);
    if (success) {
      onClose();
      setIsCartOpen(true);
      if (onDirectCheckout) {
        onDirectCheckout();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Large Image Column */}
          <div className="relative bg-slate-50 min-h-[260px] md:min-h-full flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="max-h-[320px] w-auto max-w-full object-contain rounded-xl"
            />
            {discountPercent > 0 && (
              <div className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-md">
                {toBengaliNumber(discountPercent)}% মূল্যছাড়!
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                  {product.category || 'সাধারণ পণ্য'}
                </span>
                {isOutOfStock ? (
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> স্টক আউট
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> স্টকে আছে ({toBengaliNumber(product.stock)}টি)
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 py-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-700">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="py-2 border-t border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  পণ্যের বিবরণ:
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto pr-1">
                  {product.desc ? product.desc : 'কোনো বিশেষ বিবরণ দেওয়া নেই। শতভাগ আসল পণ্য ও বিশ্বস্ত সেবা।'}
                </p>
              </div>

              {/* Special Terms: products/{id}/terms */}
              {Boolean(product.terms && product.terms.trim()) && (
                <div
                  style={{ backgroundColor: '#fffbeb', borderColor: '#f97316', color: '#b45309' }}
                  className="p-3.5 rounded-xl border-2 shadow-xs space-y-1.5"
                >
                  <h5 className="font-bold text-xs sm:text-sm flex items-center gap-1.5" style={{ color: '#b45309' }}>
                    <span>⚠️ বিশেষ শর্ত</span>
                  </h5>
                  <p
                    className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium"
                    style={{ color: '#b45309' }}
                  >
                    {product.terms}
                  </p>
                </div>
              )}

              {/* Quantity Picker */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-700">পরিমাণ:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-800 text-sm">
                      {toBengaliNumber(quantity)}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= maxAvailable}
                      className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-teal-600" />
                  <span>দ্রুত হোম ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border-2 border-teal-600 text-teal-700 hover:bg-teal-50 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white transition flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>কার্টে রাখুন</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
              >
                <span>সরাসরি অর্ডার</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

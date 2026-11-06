import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, toBengaliNumber } from '../utils/formatters';
import { ImageWithFallback } from './ImageWithFallback';
import { StoreSettings } from '../types';

interface CartDrawerProps {
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  settings,
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const { cart, updateQty, removeFromCart, subtotal, totalItems, clearCart } = useCart();

  if (!isOpen) return null;

  const deliveryCharge = Number(settings.deliveryCharge) || 60;
  const grandTotal = subtotal > 0 ? subtotal + deliveryCharge : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 bg-teal-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-teal-200" />
              <h2 className="text-base sm:text-lg font-bold">আপনার শপিং কার্ট</h2>
              <span className="bg-teal-700/80 text-teal-100 text-xs px-2 py-0.5 rounded-full font-medium">
                {toBengaliNumber(totalItems)}টি আইটেম
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-teal-700 text-teal-100 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-2">
                  <ShoppingBag className="w-10 h-10 opacity-60" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  আপনার কার্ট বর্তমানে খালি!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs">
                  পছন্দের পণ্যগুলো কার্টে যোগ করুন এবং সহজে অর্ডার করুন।
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition"
                >
                  কেনাকাটা শুরু করুন
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">আইটেমসমূহ</span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
                  >
                    সব মুছুন
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all shadow-2xs"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs sm:text-sm font-bold text-teal-700">
                          {formatPrice(item.price)}
                        </span>

                        {/* Quantity Counter */}
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                          <button
                            onClick={() => updateQty(item.productId, -1)}
                            className="p-1 text-slate-600 hover:bg-slate-100 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-slate-800 text-xs">
                            {toBengaliNumber(item.qty)}
                          </span>
                          <button
                            onClick={() => updateQty(item.productId, 1)}
                            disabled={item.qty >= item.stock}
                            className="p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer calculation & checkout */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>পণ্যমূল্য (সাবটোটাল):</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" /> ডেলিভারি চার্জ:
                  </span>
                  <span className="font-semibold text-slate-800">{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                  <span>সর্বমোট:</span>
                  <span className="text-teal-700 text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-600/25 transition"
              >
                <span>চেকআউট করুন ({formatPrice(grandTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

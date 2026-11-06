import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp, Clock, CheckCircle2, Truck, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { useUserOrders } from '../hooks/useUserOrders';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatBengaliDate, toBengaliNumber, orderStatusMap } from '../utils/formatters';
import { ImageWithFallback } from './ImageWithFallback';
import { Order } from '../types';

interface OrdersViewProps {
  onStartShopping: () => void;
  onPromptLogin: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onStartShopping, onPromptLogin }) => {
  const { currentUser } = useAuth();
  const { orders, loading, error } = useUserOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <Package className="w-8 h-8 opacity-70" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">লগইন প্রয়োজন</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-5">
          আপনার পূর্ববর্তী অর্ডারসমূহের লাইভ স্ট্যাটাস দেখতে দয়া করে লগইন করুন।
        </p>
        <button
          onClick={onPromptLogin}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition"
        >
          লগইন / রেজিস্টার করুন
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500 font-medium">অর্ডার তালিকা লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-700 text-sm">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
          আপনার কোনো অর্ডার নেই!
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-5">
          এখনো আল-আমিন মার্কেটপ্লেস থেকে কোনো অর্ডার করা হয়নি। পছন্দমতো পণ্য বাছাই করে দ্রুত অর্ডার করুন।
        </p>
        <button
          onClick={onStartShopping}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition"
        >
          কেনাকাটা শুরু করুন
        </button>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'processing':
        return <Clock className="w-3.5 h-3.5" />;
      case 'shipped':
        return <Truck className="w-3.5 h-3.5" />;
      case 'delivered':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5" />;
      case 'pending':
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">আমার অর্ডারসমূহ</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট {toBengaliNumber(orders.length)}টি অর্ডার পাওয়া গেছে (লাইভ আপডেট হচ্ছে)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order: Order) => {
          const isExpanded = expandedOrderId === order.id;
          const statusInfo = orderStatusMap[order.status] || {
            label: order.status,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            border: 'border-slate-300'
          };

          const itemsArray = Object.keys(order.items || {}).map((key) => ({
            productId: key,
            ...order.items[key]
          }));

          const totalQty = itemsArray.reduce((sum, it) => sum + (it.qty || 1), 0);

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all overflow-hidden"
            >
              {/* Order Header / Row */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs sm:text-sm text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                    >
                      {getStatusIcon(order.status)}
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {formatBengaliDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block">
                      {toBengaliNumber(totalQty)}টি আইটেম
                    </span>
                    <span className="text-sm sm:text-base font-bold text-teal-700">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <button
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    aria-label="বিস্তারিত দেখুন"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Order Items Expanded */}
              {isExpanded && (
                <div className="bg-slate-50/60 p-4 sm:p-5 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                  {/* Delivery address info */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="text-slate-500 font-semibold">ডেলিভারির তথ্য:</p>
                    <p className="text-slate-800 font-medium">নাম: {order.name}</p>
                    <p className="text-slate-800 font-medium">ফোন: {order.phone}</p>
                    <p className="text-slate-800 font-medium">ঠিকানা: {order.address}</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">অর্ডারের পণ্যসমূহ:</p>
                    {itemsArray.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image ? (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                              {idx + 1}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-slate-800 truncate">
                              {item.name}
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              {formatPrice(item.price)} × {toBengaliNumber(item.qty)}টি
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-800">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-semibold text-slate-600">মোট পরিশোধযোগ্য (ক্যাশ অন ডেলিভারি):</span>
                    <span className="font-bold text-teal-700 text-base">{formatPrice(order.total)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

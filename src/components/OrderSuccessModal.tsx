import React from 'react';
import { CheckCircle2, PackageCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

interface OrderSuccessModalProps {
  orderId: string;
  total: number;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderId,
  total,
  onViewOrders,
  onContinueShopping
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
          অর্ডার সফলভাবে সম্পন্ন হয়েছে!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
          আল-আমিন মার্কেটপ্লেসে কেনাকাটা করার জন্য ধন্যবাদ। আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করবেন।
        </p>

        {/* Order details badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">অর্ডার নম্বর:</span>
            <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm">
              #{orderId.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">পেমেন্ট মেথড:</span>
            <span className="font-semibold text-slate-700">ক্যাশ অন ডেলিভারি</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
            <span className="text-slate-500">মোট মূল্য:</span>
            <span className="font-bold text-teal-700 text-sm">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={onViewOrders}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2"
          >
            <PackageCheck className="w-4 h-4" />
            <span>আমার অর্ডারের স্ট্যাটাস দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>আরও কেনাকাটা করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

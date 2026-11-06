import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Truck, Phone, User, MapPin, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { StoreSettings, OrderItem } from '../types';
import { formatPrice, isValidBDPhone } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onOrderSuccess: (orderId: string, total: number) => void;
  onPromptLogin: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOrderSuccess,
  onPromptLogin
}) => {
  const { currentUser, userProfile } = useAuth();
  const { cart, subtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const deliveryCharge = Number(settings.deliveryCharge) || 60;
  const grandTotal = subtotal + deliveryCharge;

  // Pre-fill fields from profile when available
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || currentUser?.displayName || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
    } else if (currentUser) {
      setName(currentUser.displayName || '');
    }
  }, [userProfile, currentUser, isOpen]);

  if (!isOpen) return null;

  // If user is not logged in, prompt login
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">লগইন প্রয়োজন</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            অর্ডারটি সম্পন্ন করতে দয়া করে প্রথমে আপনার অ্যাকাউন্টে লগইন অথবা নিবন্ধন করুন।
          </p>
          <button
            onClick={() => {
              onClose();
              onPromptLogin();
            }}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition"
          >
            লগইন / রেজিস্টার করুন
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম দিন।');
      return;
    }

    if (!isValidBDPhone(phone)) {
      setErrorMessage('সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }

    if (!address.trim() || address.trim().length < 8) {
      setErrorMessage('অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা দিন (বাড়ি/রোড/এলাকা/জেলা)।');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('আপনার কার্ট খালি!');
      return;
    }

    setLoading(true);

    try {
      // Structure items as required by prompt:
      // items: { productId: { name, price, qty } }
      const orderItems: Record<string, OrderItem> = {};
      cart.forEach((item) => {
        orderItems[item.productId] = {
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image || ''
        };
      });

      // Strict adherence to required fields:
      // uid, name, phone, address, items, total, status, createdAt
      // status = "pending", createdAt = Date.now() (number), uid = currentUser.uid
      const orderData = {
        uid: currentUser.uid,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: orderItems,
        total: grandTotal,
        status: 'pending',
        createdAt: Date.now()
      };

      const ordersRef = ref(db, 'orders');
      const newOrderRef = await push(ordersRef, orderData);
      const generatedId = newOrderRef.key || 'NEW-ORDER';

      // Clear cart
      clearCart();

      // Notify parent
      onOrderSuccess(generatedId, grandTotal);
      onClose();
      showToast('আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে!', 'success');
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(
        err?.message ? `অর্ডার সম্পন্ন হতে পারেনি: ${err.message}` : 'অর্ডার সম্পন্ন হতে পারেনি। পুনরায় চেষ্টা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-teal-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-200" />
            <h2 className="text-base sm:text-lg font-bold">অর্ডার কনফার্মেশন</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-teal-700 text-teal-100 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirmOrder} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer info fields */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>ডেলিভারির ঠিকানা ও তথ্য</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                গ্রাহকের নাম <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর (ডেলিভারি যোগাযোগের জন্য) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১XXXXXXXXX"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">সঠিক ফোন নম্বর দিন যাতে ডেলিভারিম্যান যোগাযোগ করতে পারেন</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সম্পূর্ণ ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা/হোল্ডিং নম্বর, রোড, এলাকা, থানা, জেলা"
                className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">ক্যাশ অন ডেলিভারি (COD)</h4>
                <p className="text-[11px] text-slate-600">পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন। অগ্রিম কোনো টাকা দিতে হবে না।</p>
              </div>
            </div>
          </div>

          {/* Pricing summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>পণ্যমূল্য ({cart.length}টি প্রকার):</span>
              <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-semibold text-slate-800">{formatPrice(deliveryCharge)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
              <span>সর্বমোট প্রদেয় মূল্য:</span>
              <span className="text-teal-700 text-lg">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-teal-600/25 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>অর্ডার সাবমিট হচ্ছে...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>অর্ডার নিশ্চিত করুন ({formatPrice(grandTotal)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, Phone, MapPin, Star, LogOut, Edit3, Check, X, ShieldAlert, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { toBengaliNumber, isValidBDPhone } from '../utils/formatters';
import { StoreSettings } from '../types';

interface ProfileViewProps {
  settings: StoreSettings;
  onNavigateTab: (tab: 'home' | 'categories' | 'cart' | 'orders' | 'profile') => void;
  onPromptLogin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ settings, onNavigateTab, onPromptLogin }) => {
  const { currentUser, userProfile, logout, updateCustomerProfile } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 opacity-70" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">প্রোফাইল দেখার জন্য লগইন করুন</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-5">
          আপনার প্রোফাইল তথ্য, রিওয়ার্ড পয়েন্ট ও ঠিকানা দেখতে একাউন্টে প্রবেশ করুন।
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

  const startEdit = () => {
    setName(userProfile?.name || currentUser.displayName || '');
    setPhone(userProfile?.phone || '');
    setAddress(userProfile?.address || '');
    setEditError('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!name.trim()) {
      setEditError('নাম খালি রাখা যাবে না।');
      return;
    }

    if (phone.trim() && !isValidBDPhone(phone)) {
      setEditError('সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01712345678)');
      return;
    }

    setSaving(true);
    try {
      // NOTE: Strictly updates only name, phone, address! points is untouched.
      await updateCustomerProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      setIsEditing(false);
      showToast('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!', 'success');
    } catch (err: any) {
      console.error('Update profile error:', err);
      setEditError(err.message || 'প্রোফাইল আপডেট করা যায়নি।');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('লগআউট সফল হয়েছে', 'info');
      onNavigateTab('home');
    } catch (err: any) {
      showToast('লগআউট করা যায়নি', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 relative flex items-end p-4">
          <div className="absolute top-3 right-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-white text-xs font-semibold backdrop-blur-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="px-5 pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-4 gap-3">
            <div className="flex items-end gap-3">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md text-teal-700 flex items-center justify-center font-bold text-2xl uppercase">
                {(userProfile?.name || currentUser.displayName || 'গ')[0]}
              </div>
              <div className="pb-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {userProfile?.name || currentUser.displayName || 'সম্মানিত গ্রাহক'}
                </h2>
                <span className="text-xs text-slate-500">{currentUser.email}</span>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={startEdit}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-teal-700 hover:bg-teal-50 text-xs sm:text-sm font-semibold transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>প্রোফাইল এডিট করুন</span>
              </button>
            )}
          </div>

          {/* Reward Points Card (Read-Only) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-2xs mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
                <Star className="w-6 h-6 fill-amber-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                    রিওয়ার্ড পয়েন্ট (Reward Points)
                  </h4>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-sm font-medium">
                    অপরিবর্তনযোগ্য
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  অর্ডার ও শপিং করে অর্জিত পয়েন্ট (শুধুমাত্র অ্যাডমিন দ্বারা নির্ধারিত হয়)
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">
                ⭐ {toBengaliNumber(userProfile?.points || 0)}
              </span>
            </div>
          </div>

          {/* Edit Form or Display View */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">ব্যক্তিগত তথ্য পরিবর্তন</h3>

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">পূর্ণ নাম</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ডেলিভারি ঠিকানা</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বাসা নং, রোড, থানা, জেলা"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">ফোন নম্বর</span>
                  <span className="font-semibold text-slate-800">
                    {userProfile?.phone ? userProfile.phone : 'ফোন নম্বর যোগ করা হয়নি'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-slate-400 block">ডেলিভারি ঠিকানা</span>
                  <span className="font-semibold text-slate-800">
                    {userProfile?.address ? userProfile.address : 'ঠিকানা যোগ করা হয়নি'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab('orders')}
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 shadow-xs flex items-center gap-3 text-left transition"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">আমার অর্ডারসমূহ</h4>
            <p className="text-[11px] text-slate-500">চলমান ও পূর্বের সকল অর্ডার দেখুন</p>
          </div>
        </button>

        {settings.phone && (
          <a
            href={`tel:${settings.phone}`}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 shadow-xs flex items-center gap-3 text-left transition"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">কাস্টমার সাপোর্ট</h4>
              <p className="text-[11px] text-slate-500">কল করুন: {settings.phone}</p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
};

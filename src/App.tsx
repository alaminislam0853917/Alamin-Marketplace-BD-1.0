import React, { useState, useMemo } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { useRealtimeData } from './hooks/useRealtimeData';
import { Header } from './components/Header';
import { NoticeBar } from './components/NoticeBar';
import { CategoryChips } from './components/CategoryChips';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AuthModal } from './components/AuthModal';
import { OrdersView } from './components/OrdersView';
import { ProfileView } from './components/ProfileView';
import { CategoriesView } from './components/CategoriesView';
import { BottomNav, NavTab } from './components/BottomNav';
import { FloatingCartButton } from './components/FloatingCartButton';
import { BannerSlider } from './components/BannerSlider';
import { Product } from './types';
import { toBengaliNumber } from './utils/formatters';
import { Search, Sparkles, ShoppingBag, AlertCircle } from 'lucide-react';

function MarketplaceContent() {
  const { settings, categories, products, banners, loading, error } = useRealtimeData();
  const { isCartOpen, setIsCartOpen } = useCart();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Filter states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successfulOrder, setSuccessfulOrder] = useState<{ id: string; total: number } | null>(null);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category check
      if (selectedCategoryId !== 'all') {
        const matchesCat =
          product.category === selectedCategoryId ||
          categories.some((c) => c.id === selectedCategoryId && c.name === product.category);
        if (!matchesCat) return false;
      }

      // 2. Search check
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(query);
        const descMatch = product.desc?.toLowerCase().includes(query);
        const catMatch = product.category?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [products, selectedCategoryId, searchQuery, categories]);

  // Handle Tab navigation
  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'cart') {
      setIsCartOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromView = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthWithMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleOrderConfirmed = (orderId: string, total: number) => {
    setSuccessfulOrder({ id: orderId, total });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* 1. Header with branding and search */}
      <Header
        settings={settings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuth={() => openAuthWithMode('login')}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateTab={handleSelectTab}
      />

      {/* 2. Scrolling Notice Bar from settings.notice */}
      <NoticeBar notice={settings.notice} />

      {/* 3. Category Chips (visible on home tab) */}
      {currentTab === 'home' && (
        <CategoryChips
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      )}

      {/* 4. Main Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-24">
        {currentTab === 'home' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Live Realtime Banner Slider (hidden if banners is empty) */}
            <BannerSlider banners={banners} />

            {/* Promotional Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white p-5 sm:p-8 shadow-sm">
              <div className="relative z-10 max-w-md space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-teal-50">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>সেরা অফার ও দ্রুত ডেলিভারি</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
                  {settings.shopName || 'আল-আমিন মার্কেটপ্লেস'}
                </h2>
                <p className="text-xs sm:text-sm text-teal-100 font-normal">
                  আপনার বিশ্বস্ত নিত্যপ্রয়োজনীয় বাজার। আসল পণ্যের নিশ্চয়তা ও ক্যাশ অন ডেলিভারি সুবিধা।
                </p>
              </div>
              <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
            </div>

            {/* Title / Filter State Indicator */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  {searchQuery ? `"${searchQuery}" এর ফলাফল` : selectedCategoryId !== 'all' ? 'বাছাইকৃত পণ্য' : 'সকল পণ্য'}
                </h3>
                <span className="text-xs text-slate-500">
                  মোট {toBengaliNumber(filteredProducts.length)}টি পণ্য পাওয়া গেছে
                </span>
              </div>

              {(selectedCategoryId !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategoryId('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition"
                >
                  ফিল্টার মুছুন
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">পণ্য লোড হচ্ছে...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 max-w-md mx-auto my-8">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">কোনো পণ্য পাওয়া যায়নি</h4>
                <p className="text-xs sm:text-sm text-slate-500 mb-4">
                  {searchQuery
                    ? 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো পণ্য পাওয়া যায়নি।'
                    : 'বর্তমানে এই বিভাগে কোনো সক্রিয় পণ্য নেই।'}
                </p>
                {(selectedCategoryId !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategoryId('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
                  >
                    সব পণ্য দেখুন
                  </button>
                )}
              </div>
            ) : (
              /* Product Grid: 2 columns on mobile, 3-4 on larger devices */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={(prod) => setSelectedProduct(prod)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {currentTab === 'categories' && (
          <CategoriesView
            categories={categories}
            products={products}
            onSelectCategory={handleSelectCategoryFromView}
          />
        )}

        {/* Orders Tab */}
        {currentTab === 'orders' && (
          <OrdersView
            onStartShopping={() => setCurrentTab('home')}
            onPromptLogin={() => openAuthWithMode('login')}
          />
        )}

        {/* Profile Tab */}
        {currentTab === 'profile' && (
          <ProfileView
            settings={settings}
            onNavigateTab={handleSelectTab}
            onPromptLogin={() => openAuthWithMode('login')}
          />
        )}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton onOpen={() => setIsCartOpen(true)} />

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onDirectCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        settings={settings}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        settings={settings}
        onOrderSuccess={handleOrderConfirmed}
        onPromptLogin={() => openAuthWithMode('login')}
      />

      {/* Order Success Modal */}
      {successfulOrder && (
        <OrderSuccessModal
          orderId={successfulOrder.id}
          total={successfulOrder.total}
          onViewOrders={() => {
            setSuccessfulOrder(null);
            setCurrentTab('orders');
          }}
          onContinueShopping={() => {
            setSuccessfulOrder(null);
            setCurrentTab('home');
          }}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MarketplaceContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

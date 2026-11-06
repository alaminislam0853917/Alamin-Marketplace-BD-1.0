import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { StoreSettings, Category, Product, Banner } from '../types';

export function useRealtimeData() {
  const [settings, setSettings] = useState<StoreSettings>({
    shopName: 'আল-আমিন মার্কেটপ্লেস',
    deliveryCharge: 60,
    phone: '01700000000',
    notice: 'স্বাগতম আল-আমিন মার্কেটপ্লেসে! সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।',
    logo: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Subscribe to settings (shopName, deliveryCharge, phone, notice, logo)
  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsub = onValue(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          setSettings((prev) => ({
            shopName: val.shopName || prev.shopName,
            deliveryCharge: typeof val.deliveryCharge === 'number' ? val.deliveryCharge : (parseFloat(val.deliveryCharge) || 60),
            phone: val.phone || prev.phone,
            notice: val.notice !== undefined ? val.notice : prev.notice,
            logo: val.logo !== undefined ? val.logo : prev.logo
          }));
        }
      },
      (err) => {
        console.warn('Realtime settings read error:', err.message);
      }
    );
    return () => unsub();
  }, []);

  // 2. Subscribe to banners (image, title, createdAt)
  useEffect(() => {
    const bannersRef = ref(db, 'banners');
    const unsub = onValue(
      bannersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Banner[] = Object.keys(data)
            .map((key) => {
              const item = data[key];
              return {
                id: key,
                image: item.image || '',
                title: item.title || '',
                createdAt: Number(item.createdAt) || 0
              };
            })
            .filter((b) => Boolean(b.image));

          // Sort by createdAt descending if present
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setBanners(list);
        } else {
          setBanners([]);
        }
      },
      (err) => {
        console.warn('Realtime banners read error:', err.message);
      }
    );
    return () => unsub();
  }, []);

  // 3. Subscribe to categories
  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    const unsub = onValue(
      categoriesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Category[] = Object.keys(data).map((key) => ({
            id: key,
            name: typeof data[key] === 'object' && data[key]?.name ? data[key].name : String(data[key])
          }));
          setCategories(list);
        } else {
          setCategories([]);
        }
      },
      (err) => {
        console.warn('Realtime categories read error:', err.message);
      }
    );
    return () => unsub();
  }, []);

  // 4. Subscribe to products
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsub = onValue(
      productsRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: Product[] = Object.keys(data)
              .map((key) => {
                const item = data[key];
                return {
                  id: key,
                  name: item.name || 'পণ্য',
                  price: Number(item.price) || 0,
                  oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
                  stock: item.stock !== undefined ? Number(item.stock) : 0,
                  category: item.category || 'সাধারণ',
                  image: item.image || '',
                  desc: item.desc || '',
                  terms: item.terms || '',
                  active: item.active !== false, // active if true or undefined
                  createdAt: Number(item.createdAt) || 0
                };
              })
              // Rule: "শুধু active != false পণ্য দেখাবে"
              .filter((p) => p.active !== false);

            // Sort products by newest first if createdAt exists
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            setProducts(list);
          } else {
            setProducts([]);
          }
          setLoading(false);
        } catch (err: any) {
          console.error('Error parsing products:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Realtime products read error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return {
    settings,
    categories,
    products,
    banners,
    loading,
    error
  };
}

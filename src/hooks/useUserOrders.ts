import { useState, useEffect } from 'react';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export function useUserOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // CRITICAL: Using the exact query specified by security rules
    // query(ref(db, 'orders'), orderByChild('uid'), equalTo(currentUser.uid))
    const ordersQuery = query(
      ref(db, 'orders'),
      orderByChild('uid'),
      equalTo(currentUser.uid)
    );

    const unsubscribe = onValue(
      ordersQuery,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const orderList: Order[] = Object.keys(data).map((key) => {
              const item = data[key];
              return {
                id: key,
                uid: item.uid,
                name: item.name || '',
                phone: item.phone || '',
                address: item.address || '',
                items: item.items || {},
                total: Number(item.total) || 0,
                status: item.status || 'pending',
                createdAt: Number(item.createdAt) || Date.now()
              };
            });

            // Sort newest first
            orderList.sort((a, b) => b.createdAt - a.createdAt);
            setOrders(orderList);
          } else {
            setOrders([]);
          }
          setLoading(false);
        } catch (err: any) {
          console.error('Error parsing user orders:', err);
          setError('অর্ডার তালিকা লোড করতে সমস্যা হয়েছে');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to user orders:', err);
        setError('অর্ডার ডেটা অ্যাক্সেস করতে সমস্যা হয়েছে');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return { orders, loading, error };
}

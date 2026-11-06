import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';
import { toBengaliNumber } from '../utils/formatters';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, delta: number) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'alamin_marketplace_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  // Add to cart with stock validation
  const addToCart = (product: Product, quantity: number = 1): boolean => {
    if (product.stock <= 0) {
      showToast('দুঃখিত, এই পণ্যটির স্টক শেষ হয়ে গেছে!', 'error');
      return false;
    }

    let success = true;
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id);

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].qty;
        const newQty = currentQty + quantity;

        if (newQty > product.stock) {
          showToast(`সর্বোচ্চ ${toBengaliNumber(product.stock)}টি অর্ডার করা সম্ভব!`, 'error');
          success = false;
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          stock: product.stock,
          price: product.price,
          name: product.name,
          image: product.image
        };
        showToast(`'${product.name}' এর পরিমাণ বাড়ানো হয়েছে`, 'success');
        return updated;
      } else {
        if (quantity > product.stock) {
          showToast(`সর্বোচ্চ ${toBengaliNumber(product.stock)}টি স্টক রয়েছে!`, 'error');
          success = false;
          return prev;
        }

        showToast(`'${product.name}' কার্টে যোগ করা হয়েছে`, 'success');
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            qty: quantity,
            stock: product.stock
          }
        ];
      }
    });

    return success;
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (item) {
        showToast(`'${item.name}' কার্ট থেকে সরানো হয়েছে`, 'info');
      }
      return prev.filter((i) => i.productId !== productId);
    });
  };

  // Update quantity with delta (+1 or -1)
  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.qty + delta;
            if (nextQty <= 0) {
              return null; // will be filtered out
            }
            if (nextQty > item.stock) {
              showToast(`স্টকে আর অতিরিক্ত পণ্য নেই (সর্বোচ্চ ${toBengaliNumber(item.stock)}টি)`, 'error');
              return item;
            }
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Set explicit quantity
  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const clampedQty = Math.min(qty, item.stock);
          return { ...item, qty: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        setQty,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

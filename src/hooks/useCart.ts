"use client";

import { useState, useEffect, useCallback } from "react";
import { CartTotals } from "@/types";

let sharedCartFetchPromise: Promise<CartTotals | null> | null = null;

async function getSharedCart(): Promise<CartTotals | null> {
  if (!sharedCartFetchPromise) {
    sharedCartFetchPromise = fetch("/api/cart")
      .then((res) => (res.ok ? res.json() : null))
      .catch((err) => {
        console.error("Error loading cart:", err);
        return null;
      })
      .finally(() => {
        setTimeout(() => {
          sharedCartFetchPromise = null;
        }, 150);
      });
  }
  return sharedCartFetchPromise;
}

export function useCart() {
  const [cart, setCart] = useState<CartTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getSharedCart();
      if (data) {
        setCart(data);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();

    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("echo:cart-updated", handleCartUpdate);
    return () => window.removeEventListener("echo:cart-updated", handleCartUpdate);
  }, [fetchCart]);

  const addItem = async (itemConfig: {
    itemId: string;
    variantId?: string;
    customizations?: Array<{ groupId: string; optionId: string }>;
    quantity?: number;
  }) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemConfig),
      });
      if (res.ok) {
        const updated = await res.json();
        setCart(updated);
        sharedCartFetchPromise = null;
        window.dispatchEvent(new CustomEvent("echo:cart-updated"));
        return updated;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCart(updated);
        sharedCartFetchPromise = null;
        window.dispatchEvent(new CustomEvent("echo:cart-updated"));
      }
    } catch (err) {
      console.error("Error updating cart quantity:", err);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const res = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = await res.json();
        setCart(updated);
        sharedCartFetchPromise = null;
        window.dispatchEvent(new CustomEvent("echo:cart-updated"));
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  return {
    cart,
    isLoading,
    itemCount: cart?.itemCount || 0,
    addItem,
    updateQuantity,
    removeItem,
    refetch: fetchCart,
  };
}

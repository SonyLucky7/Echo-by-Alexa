"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, ArrowRight } from "lucide-react";

export const CartDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, isLoading, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("echo:open-cart", handleOpen);
    window.addEventListener("echo:close-cart", handleClose);

    return () => {
      window.removeEventListener("echo:open-cart", handleOpen);
      window.removeEventListener("echo:close-cart", handleClose);
    };
  }, []);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={`Your Tasting Cart (${cart?.itemCount || 0})`}
      width="md"
    >
      {isLoading ? (
        <div className="py-20 text-center text-charcoal/50">
          <div className="animate-spin w-6 h-6 border-2 border-olive border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-xs">Refreshing cart...</p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-cream/70 flex items-center justify-center text-charcoal/30 mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h4 className="font-serif text-xl font-medium text-charcoal mb-2">
            Your Cart is Empty
          </h4>
          <p className="text-xs text-charcoal/60 max-w-xs font-light leading-relaxed mb-6">
            Explore our curated hearth dishes, wood-fired cuts, and wild botanical infusions.
          </p>
          <Link
            href="/menu"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal text-ivory text-xs font-medium uppercase tracking-wider hover:bg-ember transition-colors"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-1 divide-y divide-charcoal/5 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <CartSummary totals={cart} onCloseCart={() => setIsOpen(false)} />
        </div>
      )}
    </Drawer>
  );
};

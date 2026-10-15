"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, ShoppingBag, ExternalLink, Flame } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/hooks/useCart";

interface ToolResultCardProps {
  tool: string;
  result: any;
}

export const ToolResultCard: React.FC<ToolResultCardProps> = ({ tool, result }) => {
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!result || result.error) return null;

  const handleQuickAdd = async (itemId: string) => {
    setAddingId(itemId);
    try {
      await addItem({ itemId, quantity: 1 });
      setAddedIds((prev) => [...prev, itemId]);
      window.dispatchEvent(new CustomEvent("echo:cart-updated"));
      setTimeout(() => {
        setAddedIds((prev) => prev.filter((id) => id !== itemId));
      }, 2500);
    } catch (err) {
      console.error("Failed to quick add item:", err);
    } finally {
      setAddingId(null);
    }
  };

  // 1. Menu browse & recommendations
  if (tool === "browse_menu" || tool === "recommend_items") {
    let items: any[] = [];
    if (Array.isArray(result)) {
      items = result.slice(0, 3);
    } else if (result.items && Array.isArray(result.items)) {
      items = result.items.slice(0, 3);
    } else if (result.highlight) {
      items = [result.highlight, result.complement].filter(Boolean);
    }

    if (items.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {result.pairingSuggestion && (
          <div className="text-xs bg-ember/10 text-ember-dark px-3 py-1.5 rounded-lg border border-ember/20 font-serif italic flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-ember" />
            Sommelier Pairing: {result.pairingSuggestion}
          </div>
        )}
        <div className="grid grid-cols-1 gap-2">
          {items.map((item: any) => {
            const isAdded = addedIds.includes(item.id);
            const isAdding = addingId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-ivory-50 border border-ivory-300 hover:border-ember/40 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.imageUrl && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-ivory-300">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-serif font-medium text-sm text-charcoal truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-charcoal/60 font-sans">
                      {item.priceFormatted || `$${((item.priceMinor || 0) / 100).toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(item.id)}
                  disabled={isAdding}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center gap-1 transition-all ${
                    isAdded
                      ? "bg-forest text-ivory"
                      : "bg-charcoal text-ivory hover:bg-ember"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. View cart
  if (tool === "view_cart" || tool === "add_to_cart") {
    const summary = result.summary || result;
    const items = summary.items || [];
    return (
      <div className="mt-3 p-3 rounded-xl bg-ivory-100 border border-ivory-300">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-ivory-200">
          <span className="text-xs font-sans font-medium uppercase tracking-wider text-charcoal/70 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-ember" />
            Current Cart ({summary.itemCount || 0} items)
          </span>
          <span className="font-serif font-semibold text-charcoal text-sm">
            {summary.formattedTotal || summary.total || "$0.00"}
          </span>
        </div>

        {items.length > 0 && (
          <div className="space-y-1 mb-3 max-h-32 overflow-y-auto pr-1">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs text-charcoal/80">
                <span className="truncate pr-2">
                  {it.quantity}x {it.name}
                </span>
                <span className="font-mono">{it.lineTotal || ""}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("echo:open-cart"))}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-ivory border border-ivory-300 text-charcoal hover:bg-ivory-200 transition-colors"
          >
            Review Cart
          </button>
          <Link
            href="/checkout"
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-center bg-charcoal text-ivory hover:bg-ember transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    );
  }

  // 3. Order status
  if (tool === "get_order_status") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ivory-100 border border-ivory-300">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono font-medium text-xs text-charcoal">
            {result.orderRef}
          </span>
          <Badge variant="status" className="text-xs uppercase bg-forest/10 text-forest border-forest/20">
            {result.status}
          </Badge>
        </div>
        <p className="text-xs text-charcoal/70 mb-2">
          Mode: <strong className="font-medium text-charcoal">{result.fulfillmentMode}</strong> • Total: <strong className="font-medium text-charcoal">{result.total}</strong>
        </p>
        <Link
          href={`/orders/${result.orderRef}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-ember hover:underline"
        >
          View live tracking timeline <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  // 4. Restaurant information
  if (tool === "get_restaurant_information") {
    return (
      <div className="mt-3 p-3 rounded-xl bg-ivory-100 border border-ivory-300 text-xs space-y-1.5 text-charcoal/80">
        <p>
          <strong className="text-charcoal font-serif">Hours:</strong> {result.hours}
        </p>
        <p>
          <strong className="text-charcoal font-serif">Address:</strong> {result.address}
        </p>
        <p>
          <strong className="text-charcoal font-serif">Contact:</strong> {result.phone}
        </p>
      </div>
    );
  }

  return null;
};

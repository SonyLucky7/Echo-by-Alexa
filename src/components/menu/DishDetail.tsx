"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/currency";
import { Plus, Minus, Flame, ShieldAlert, Check } from "lucide-react";

export interface DishDetailProps {
  itemId: string | null;
  onClose: () => void;
  onAddToCart: (itemConfig: {
    itemId: string;
    variantId?: string;
    customizations: Array<{ groupId: string; optionId: string }>;
    quantity: number;
    calculatedPriceMinor: number;
    name: string;
    variantName?: string;
    imageUrl: string;
  }) => void;
}

export const DishDetail: React.FC<DishDetailProps> = ({
  itemId,
  onClose,
  onAddToCart,
}) => {
  const [dish, setDish] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Fetch full dish data when itemId changes
  useEffect(() => {
    if (!itemId) {
      setDish(null);
      return;
    }

    setIsLoading(true);
    fetch(`/api/menu/${itemId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setDish(data);
        if (data) {
          // Set default variant
          const defVariant = data.variants?.find((v: any) => v.isDefault) || data.variants?.[0];
          setSelectedVariantId(defVariant?.id || null);

          // Set default customizations
          const initialOpts: Record<string, string[]> = {};
          data.customizationGroups?.forEach((group: any) => {
            const defaults = group.options?.filter((o: any) => o.isDefault).map((o: any) => o.id) || [];
            if (defaults.length > 0) {
              initialOpts[group.id] = defaults;
            }
          });
          setSelectedOptions(initialOpts);
          setQuantity(1);
          setAddedSuccess(false);
        }
      })
      .catch((err) => console.error("Error fetching dish details:", err))
      .finally(() => setIsLoading(false));
  }, [itemId]);

  if (!itemId) return null;

  // Calculate live dynamic price
  const selectedVariant = dish?.variants?.find((v: any) => v.id === selectedVariantId);
  const basePriceMinor = selectedVariant ? selectedVariant.priceMinor : dish?.basePriceMinor || 0;

  let customizationDeltaMinor = 0;
  if (dish?.customizationGroups) {
    dish.customizationGroups.forEach((group: any) => {
      const selectedForGroup = selectedOptions[group.id] || [];
      group.options.forEach((opt: any) => {
        if (selectedForGroup.includes(opt.id)) {
          customizationDeltaMinor += opt.priceDeltaMinor;
        }
      });
    });
  }

  const unitPriceMinor = basePriceMinor + customizationDeltaMinor;
  const totalPriceMinor = unitPriceMinor * quantity;

  // Handle option selection with min/max enforcement
  const handleToggleOption = (groupId: string, optionId: string, maxSelections: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return {
          ...prev,
          [groupId]: current.filter((id) => id !== optionId),
        };
      } else {
        if (maxSelections === 1) {
          return {
            ...prev,
            [groupId]: [optionId],
          };
        } else if (current.length < maxSelections) {
          return {
            ...prev,
            [groupId]: [...current, optionId],
          };
        }
        return prev;
      }
    });
  };

  const handleAddToCartClick = () => {
    if (!dish) return;

    const flattenedCustomizations: Array<{ groupId: string; optionId: string }> = [];
    Object.entries(selectedOptions).forEach(([groupId, optionIds]) => {
      optionIds.forEach((optionId) => {
        flattenedCustomizations.push({ groupId, optionId });
      });
    });

    onAddToCart({
      itemId: dish.id,
      variantId: selectedVariantId || undefined,
      customizations: flattenedCustomizations,
      quantity,
      calculatedPriceMinor: totalPriceMinor,
      name: dish.name,
      variantName: selectedVariant?.name,
      imageUrl: dish.imageUrl,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <Modal isOpen={Boolean(itemId)} onClose={onClose} maxWidth="xl">
      {isLoading || !dish ? (
        <div className="py-20 text-center text-charcoal/50">
          <div className="animate-spin w-8 h-8 border-2 border-olive border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Retrieving culinary details...</p>
        </div>
      ) : (
        <div className="space-y-6 text-left">
          {/* Header Image */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-sand -mt-2">
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
            {dish.spiceLevel > 0 && (
              <div className="absolute top-3 left-3 bg-charcoal/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-ember text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 fill-ember" />
                <span>Spice: {dish.spiceLevel}/3</span>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
                {dish.name}
              </h2>
              <span className="font-serif text-2xl font-semibold text-charcoal">
                {formatCurrency(totalPriceMinor, "USD")}
              </span>
            </div>
            <p className="text-charcoal/70 text-sm font-light leading-relaxed">
              {dish.description}
            </p>
          </div>

          {/* Dietary & Allergens Info */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-charcoal/10">
            {dish.dietaryFlags?.map((flag: string) => (
              <Badge key={flag} variant="dietary" size="sm">
                {flag.replace("_", " ")}
              </Badge>
            ))}
            {dish.allergens?.length > 0 && (
              <div className="w-full flex items-center gap-1.5 text-xs text-charcoal/60 mt-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Contains: {dish.allergens.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Portion Variants (if any) */}
          {dish.variants?.length > 1 && (
            <div className="space-y-2.5 pt-2 border-t border-charcoal/10">
              <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 block">
                Portion Size / Cut
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dish.variants.map((v: any) => {
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        isSelected
                          ? "bg-charcoal text-ivory border-charcoal shadow-xs"
                          : "bg-cream/40 border-charcoal/15 text-charcoal hover:bg-cream"
                      }`}
                    >
                      <span className="text-xs font-medium">{v.name}</span>
                      <span className="text-xs font-semibold">
                        {formatCurrency(v.priceMinor, "USD")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customization Groups */}
          {dish.customizationGroups?.map((group: any) => (
            <div key={group.id} className="space-y-2.5 pt-2 border-t border-charcoal/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">
                  {group.name}
                </span>
                <span className="text-[11px] text-charcoal/40">
                  {group.maxSelections === 1
                    ? "Choose 1"
                    : `Select up to ${group.maxSelections}`}
                </span>
              </div>
              <div className="space-y-1.5">
                {group.options.map((opt: any) => {
                  const isSelected = (selectedOptions[group.id] || []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleOption(group.id, opt.id, group.maxSelections)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-olive/10 border-olive text-charcoal"
                          : "bg-cream/30 border-charcoal/10 text-charcoal/80 hover:bg-cream"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-olive border-olive text-ivory"
                              : "border-charcoal/30 bg-ivory"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="text-xs font-medium">{opt.name}</span>
                      </div>
                      <span className="text-xs font-medium text-charcoal/60">
                        {opt.priceDeltaMinor > 0
                          ? `+${formatCurrency(opt.priceDeltaMinor, "USD")}`
                          : "Included"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity & Add to Cart Footer */}
          <div className="pt-4 border-t border-charcoal/10 flex items-center justify-between gap-4">
            <div className="flex items-center border border-charcoal/15 rounded-full bg-cream/40 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal hover:bg-ivory transition-colors disabled:opacity-40"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-charcoal">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal hover:bg-ivory transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              variant="ember"
              size="lg"
              onClick={handleAddToCartClick}
              disabled={addedSuccess}
              className="flex-1 py-3"
            >
              {addedSuccess ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Added to Cart
                </span>
              ) : (
                `Add to Cart • ${formatCurrency(totalPriceMinor, "USD")}`
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

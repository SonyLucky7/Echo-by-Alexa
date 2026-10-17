"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { FulfillmentSelect, FulfillmentType } from "@/components/checkout/FulfillmentSelect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Check } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: isCartLoading } = useCart();

  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentType>("DINE_IN");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Mode-specific fields
  const [tableNumber, setTableNumber] = useState("");
  const [pickupTime, setPickupTime] = useState("20 minutes (Standard Hearth Prep)");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "WALLET">("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentProvider] = useState<"STRIPE" | "SANDBOX">("STRIPE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isCartLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-olive border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-charcoal/60">Verifying cart availability...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-6">
        <h2 className="font-serif text-3xl font-medium text-charcoal mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-charcoal/60 font-light mb-8 leading-relaxed">
          Please explore our seasonal menu and select dishes before proceeding to checkout.
        </p>
        <Link href="/menu">
          <Button variant="ember" size="lg" className="px-8">
            Return to Menu
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate dynamic fees based on active selection
  const isDelivery = fulfillmentMode === "DELIVERY";
  const isPickup = fulfillmentMode === "PICKUP";
  const subtotal = cart.subtotalMinor;
  const tax = Math.round((subtotal * 825) / 10000);
  const deliveryFee = isDelivery ? 500 : 0;
  const packagingFee = isPickup || isDelivery ? 200 : 0;
  const finalTotal = subtotal + tax + deliveryFee + packagingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg("Please enter your name for the order.");
      return;
    }

    if (fulfillmentMode === "DINE_IN" && !tableNumber.trim()) {
      setErrorMsg("Please enter your Table Number for Dine-In service.");
      return;
    }

    if (fulfillmentMode === "DELIVERY" && !deliveryAddress.trim()) {
      setErrorMsg("Please enter your delivery street address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentMode,
          customerName,
          customerEmail: customerEmail || undefined,
          customerPhone: customerPhone || undefined,
          tableNumber: tableNumber || undefined,
          pickupTime: pickupTime || undefined,
          deliveryAddress: deliveryAddress || undefined,
          deliveryNotes: deliveryNotes || undefined,
          paymentProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect to returned checkout URL (Stripe or Sandbox tracking)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/orders/${data.orderRef}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate checkout session.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-6 md:px-12 max-w-6xl mx-auto text-left">
      {/* Return Link */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal/60 hover:text-ember mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Menu</span>
      </Link>

      <div className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal mb-2">
          Hearth Order Checkout
        </h1>
        <p className="text-charcoal/60 text-sm font-light">
          Review your seasonal selections and confirm fulfillment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Fulfillment & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Fulfillment Mode */}
          <div className="bg-cream/40 rounded-3xl p-6 sm:p-8 border border-charcoal/10 space-y-6">
            <FulfillmentSelect value={fulfillmentMode} onChange={setFulfillmentMode} />

            {/* Mode Specific Inputs */}
            {fulfillmentMode === "DINE_IN" && (
              <div className="space-y-4 pt-4 border-t border-charcoal/10 animate-fade-in">
                <Input
                  label="Table or Alcove Number *"
                  placeholder="e.g., Table 4, Hearthside Table B"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                />
                <Input
                  label="Server Notes (Optional)"
                  placeholder="e.g., Celebrating an anniversary, please bring wine glasses"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
            )}

            {fulfillmentMode === "PICKUP" && (
              <div className="space-y-4 pt-4 border-t border-charcoal/10 animate-fade-in">
                <Input
                  label="Preferred Pickup Time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  helperText="Kitchen standard prep turnaround is 20 minutes."
                />
                <Input
                  label="Vehicle or Curbside Notes (Optional)"
                  placeholder="e.g., Black Sedan parked in front valet stall"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
            )}

            {fulfillmentMode === "DELIVERY" && (
              <div className="space-y-4 pt-4 border-t border-charcoal/10 animate-fade-in">
                <Input
                  label="Delivery Street Address *"
                  placeholder="e.g., 742 Evergreen Terrace, Apt 4B"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
                <Input
                  label="Gate Code & Drop-off Instructions (Optional)"
                  placeholder="e.g., Code #4821, leave on front porch"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* 2. Customer Information */}
          <div className="bg-cream/40 rounded-3xl p-6 sm:p-8 border border-charcoal/10 space-y-4">
            <h3 className="font-serif text-xl font-medium text-charcoal mb-4">
              Customer Contact
            </h3>
            <Input
              label="Full Name *"
              placeholder="Your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email (For Order Updates)"
                type="email"
                placeholder="you@domain.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              <Input
                label="Mobile Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-cream/40 rounded-3xl p-6 sm:p-8 border border-charcoal/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-medium text-charcoal">
                Payment Method
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
                <Lock className="w-3.5 h-3.5 text-olive" />
                <span>Encrypted &amp; Secure</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === "CARD"
                    ? "bg-charcoal text-ivory border-charcoal shadow-sm ring-1 ring-charcoal"
                    : "bg-ivory border-charcoal/15 text-charcoal hover:bg-cream"
                }`}
              >
                <CreditCard className={`w-5 h-5 shrink-0 ${paymentMethod === "CARD" ? "text-ember" : "text-charcoal/60"}`} />
                <div className="min-w-0">
                  <span className="text-sm font-semibold block leading-tight">Credit or Debit Card</span>
                  <span className={`text-xs block mt-0.5 truncate ${paymentMethod === "CARD" ? "text-ivory/70" : "text-charcoal/50"}`}>
                    Visa, Mastercard, Amex
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  paymentMethod === "WALLET"
                    ? "bg-charcoal text-ivory border-charcoal shadow-sm ring-1 ring-charcoal"
                    : "bg-ivory border-charcoal/15 text-charcoal hover:bg-cream"
                }`}
              >
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center font-bold text-base leading-none ${paymentMethod === "WALLET" ? "text-ember" : "text-charcoal/70"}`}>
                  
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold block leading-tight">Digital Wallet</span>
                  <span className={`text-xs block mt-0.5 truncate ${paymentMethod === "WALLET" ? "text-ivory/70" : "text-charcoal/50"}`}>
                    Apple Pay / Google Pay
                  </span>
                </div>
              </button>
            </div>

            {/* Method Details */}
            {paymentMethod === "CARD" ? (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const formatted = v.match(/.{1,4}/g)?.join(" ") || v;
                        setCardNumber(formatted);
                      }}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-4 py-3 bg-ivory border border-charcoal/20 rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-charcoal font-mono tracking-wider"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-charcoal/40 font-mono uppercase">
                      <span className="px-1.5 py-0.5 bg-charcoal/5 rounded font-semibold text-[10px]">VISA</span>
                      <span className="px-1.5 py-0.5 bg-charcoal/5 rounded font-semibold text-[10px]">MC</span>
                      <span className="px-1.5 py-0.5 bg-charcoal/5 rounded font-semibold text-[10px]">AMEX</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) {
                          v = `${v.slice(0, 2)}/${v.slice(2)}`;
                        }
                        setCardExpiry(v);
                      }}
                      placeholder="MM / YY"
                      className="w-full px-4 py-3 bg-ivory border border-charcoal/20 rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-charcoal font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">
                      Security Code
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCardCvc(v);
                        }}
                        placeholder="CVC"
                        className="w-full px-4 py-3 bg-ivory border border-charcoal/20 rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-charcoal font-mono text-center tracking-widest"
                      />
                      <Lock className="w-3.5 h-3.5 text-charcoal/30 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    value={cardName || customerName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full name as printed on card"
                    className="w-full px-4 py-3 bg-ivory border border-charcoal/20 rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-charcoal"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 bg-ivory rounded-2xl border border-charcoal/15 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-charcoal text-ivory flex items-center justify-center mx-auto text-xl font-bold">
                  
                </div>
                <h4 className="text-sm font-semibold text-charcoal">Apple Pay &amp; Google Pay Ready</h4>
                <p className="text-xs text-charcoal/60 font-light max-w-sm mx-auto">
                  Click &ldquo;Place Order&rdquo; to complete authorization seamlessly with your device biometric pass.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Submit (5 cols) */}
        <div className="lg:col-span-5 bg-ivory rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-charcoal/10">
            <h3 className="font-serif text-2xl font-medium text-charcoal">
              Order Summary
            </h3>
            <span className="text-xs uppercase tracking-wider text-olive font-semibold">
              {cart.itemCount} {cart.itemCount === 1 ? "Plate" : "Plates"}
            </span>
          </div>

          {/* Line Items List */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-charcoal/5">
            {cart.items.map((line) => (
              <div key={line.id} className="pt-2 first:pt-0 flex justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-charcoal">
                    {line.quantity}x {line.name}
                  </p>
                  {line.variantName && (
                    <p className="text-olive text-[11px] font-medium">{line.variantName}</p>
                  )}
                  {line.customizations.map((c, i) => (
                    <p key={i} className="text-charcoal/50 text-[10px]">
                      + {c.optionName}
                    </p>
                  ))}
                </div>
                <span className="font-medium text-charcoal font-serif">
                  {formatCurrency(line.lineTotalMinor, cart.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Monetary Breakdown */}
          <div className="pt-4 border-t border-charcoal/10 space-y-2 text-xs text-charcoal/70">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-charcoal">
                {formatCurrency(subtotal, cart.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Sales Tax (8.25%)</span>
              <span className="font-medium text-charcoal">
                {formatCurrency(tax, cart.currency)}
              </span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-olive">
                <span>Direct Delivery Service</span>
                <span className="font-medium">
                  {formatCurrency(deliveryFee, cart.currency)}
                </span>
              </div>
            )}
            {packagingFee > 0 && (
              <div className="flex justify-between text-olive">
                <span>Insulated Hearth Packaging</span>
                <span className="font-medium">
                  {formatCurrency(packagingFee, cart.currency)}
                </span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-4 border-t border-charcoal/10 flex justify-between items-baseline">
            <span className="font-serif text-lg font-medium text-charcoal">
              Total Due
            </span>
            <div className="text-right">
              <span className="font-serif text-3xl font-bold text-charcoal">
                {formatCurrency(finalTotal, cart.currency)}
              </span>
              <span className="block text-[10px] text-charcoal/40 uppercase tracking-widest font-mono">
                {cart.currency}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Place Order CTA */}
          <Button
            type="submit"
            variant="ember"
            size="lg"
            isLoading={isSubmitting}
            className="w-full py-4 text-base shadow-sm font-medium tracking-wide"
          >
            {isSubmitting ? (
              <span>Authorizing Order...</span>
            ) : (
              <span>Place Order • {formatCurrency(finalTotal, cart.currency)}</span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal/50 pt-2">
            <Lock className="w-3.5 h-3.5 text-olive" />
            <span>256-bit encrypted secure checkout</span>
          </div>
        </div>
      </form>
    </div>
  );
}

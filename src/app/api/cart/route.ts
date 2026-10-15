import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/lib/cart/operations";
import {
  addToCartInputSchema,
  updateCartItemInputSchema,
} from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { sessionId } = await getOrCreateSession();
    const cart = await getCart(sessionId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await getOrCreateSession();
    const body = await req.json();
    const parsed = addToCartInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid item configuration", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updatedCart = await addToCart(sessionId, parsed.data);
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add item to cart" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { sessionId } = await getOrCreateSession();
    const body = await req.json();
    const parsed = updateCartItemInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid cart update", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updatedCart = await updateCartItem(sessionId, parsed.data);
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    console.error("PUT /api/cart error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update cart item" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = await getOrCreateSession();
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("cartItemId");

    if (!cartItemId) {
      return NextResponse.json(
        { error: "Missing cartItemId parameter" },
        { status: 400 }
      );
    }

    const updatedCart = await removeFromCart(sessionId, cartItemId);
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove cart item" },
      { status: 400 }
    );
  }
}

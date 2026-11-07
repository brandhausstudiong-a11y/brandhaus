"use client"
import React from 'react'
import Image from "next/image";
import { Trash2 } from 'lucide-react';
import { ProductItem } from '@/types/product';
// import { products } from '@/data/product';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeFromCart } from '@/lib/features/cart/cartSlice';
import CartQuantitySelector from './CartQuantitySelector';
import { calculateDiscount } from '@/lib/utils';
import { selectCartCount, selectSubtotal, selectTotal, selectTotalDiscount } from '@/lib/features/cart/cartSelectors';
import Link from 'next/link';


export default function Cart() {
        const currency = process.env.CURRENCY_SYMBOL || '₦';
        const dispatch = useAppDispatch();
        const cartItems = useAppSelector((state) => state.cart.items);
        const subTotal = useAppSelector(selectSubtotal);
        const total = useAppSelector(selectTotal);
        const totalDiscount = useAppSelector(selectTotalDiscount);
        const totalCartItems = useAppSelector(selectCartCount);

        const handleRemoveFromCart = (cartId: string) => {
            dispatch(removeFromCart({ cartId }));
        };
            
  return (
        <div className="md:flex w-full px-4 md:px-6 lg:px-10">
            <div className="mt-7 md:mt-0 flex-1 h-max md:pt-7 md:px-4 lg:px-6 md:border-r">
                {/* Cart Items */}
                <div className="flex gap-1 mb-8 ">
                    <span className="text-2xl lg:text-3xl font-bold uppercase text-sidebar-foreground">Cart</span>
                    {/* <span className="text-sm">05</span> */}
                </div>
    
                <div>
                {cartItems.length > 0 ? (
                    cartItems.map((item) => {
                    const discount = calculateDiscount(
                        item.price,
                        item.percentageDiscount
                    );

                    return (
                        <div
                        key={item.id}
                        className="relative mb-8 flex w-full items-end justify-between gap-3 border-b pb-4"
                        >
                        <div className="gap-4 md:flex">
                            <div className="relative h-25 w-25 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                                src={item.featuredImage}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                            </div>

                            <div className="mt-2 flex flex-col justify-end md:mt-0">
                            <h3 className="text-md font-medium text-sidebar-foreground">
                                {item.name}
                            </h3>

                            <div className="mt-1 flex gap-4">
                                <div className="flex gap-1 text-sm">
                                <span className="text-sidebar-foreground/40">Size:</span>
                                <span className="text-sidebar-foreground">{item.size}</span>
                                </div>

                                <div className="flex gap-1 text-sm">
                                <span className="text-sidebar-foreground/40">Color:</span>
                                <span className="text-sidebar-foreground">{item.color}</span>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <Trash2
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="absolute right-0 top-0 size-5 text-red-500 lg:top-3"
                            />

                            <div className="flex flex-col items-end gap-1 lg:flex-row lg:gap-2">
                                <span className="text-md font-medium text-sidebar-foreground">
                                    {currency}
                                    {item.price.toLocaleString()}
                                </span>
                                {item.percentageDiscount > 0 && (
                                    <span className="text-sidebar-foreground/40 text-sm">
                                        %{item.percentageDiscount} off
                                    </span>
                                )}
                            </div>

                            <div className="mt-2">
                            <CartQuantitySelector
                                cartId={item.id}
                                quantity={item.quantity}
                            />
                            </div>
                        </div>
                        </div>
                    );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-sidebar-accent bg-accent px-6 py-16 text-center">
                        <h3 className="text-xl font-semibold text-sidebar-foreground">
                            Your Cart is Empty
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-sidebar-foreground/60">
                            You haven't added any outfits to your cart yet. Browse our latest
                            collections and find something you'll love.
                        </p>

                        <Link
                            href="/shop"
                            className="mt-6 inline-flex items-center justify-center rounded-md bg-sidebar-foreground px-6 py-3 text-sm font-medium text-sidebar hover:opacity-90 transition-opacity"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                )}
                </div>
            </div>
    
            <aside className="w-full md:w-[380px] md:pt-7 mt-10 md:mt-0 md:pl-4 lg:pl-10">
                {/* Summary */}
                <div className="flex gap-1 mb-8 ">
                    <h2 className="text-2xl lg:text-3xl font-bold uppercase text-sidebar-foreground">Summary</h2>
                </div>
    
                <div className="rounded-2xl border p-6">
                    <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-sidebar-foreground/50">Total Items</span>
                        <span className="font-medium text-sidebar-foreground">{totalCartItems} Items</span>
                    </div>
    
                    <div className="flex justify-between">
                        <span className="text-sidebar-foreground/50">Sub total</span>
                        <span className="font-medium text-sidebar-foreground">{currency}{subTotal.toLocaleString()}</span>
                    </div>
    
                    <div className="flex justify-between border-b border-dashed pb-4">
                        <span className="text-sidebar-foreground/50">Est. Delivery</span>
                        <span className="font-medium text-sidebar-foreground">__</span>
                    </div>
    
                    <div className="flex justify-between">
                        <span className="text-sidebar-foreground/50">Taxes</span>
                        <span className="font-medium text-red-500">__</span>
                    </div>
    
                    <div className="flex justify-between border-b border-dashed pb-4">
                        <span className="text-sidebar-foreground/50">Discount</span>
                        {
                            totalDiscount > 0 ? 
                            <span className="font-medium text-green-600">
                                %{totalDiscount} off
                            </span>
                            :
                            <span className="font-medium text-green-600">
                                __
                            </span>
                        }
                    </div>
    
                    <div className="flex justify-between pt-2 text-lg font-semibold text-sidebar-foreground">
                        <span>Total</span>
                        <span>{currency}{total.toLocaleString()}</span>
                    </div>
                    </div>
    
                    <div className="mt-8 flex items-center gap-2 rounded-full border p-1">
                    <Input
                        placeholder="Enter promo code"
                        className="border-0 shadow-none focus-visible:ring-0"
                    />
    
                    <Button className="rounded-full px-6">
                        APPLY
                    </Button>
                    </div>
                </div>
    
                {/* <Button className="mt-8 h-14 w-full rounded-full text-base font-medium">
                    CHECKOUT
                </Button> */}
                <Link
                href="/checkout"
                className="
                    flex
                    h-[64px]
                    mt-8
                    flex-1
                    items-center
                    justify-center
                    gap-3
                    bg-black
                    text-[15px]
                    text-white
                    transition-opacity
                    hover:opacity-80
                "
                >
                    CHECKOUT
                </Link>
    
                {/* <Link
                href="/shop"
                className="
                    flex
                    h-[64px]
                    mt-4
                    flex-1
                    items-center
                    justify-center
                    gap-3
                    border
                    border-black
                    text-[15px]
                    transition-colors
                    hover:bg-black
                    hover:text-white
                "
                >
                MEMBER CHECKOUT
                </Link> */}
            </aside>
        </div>
  )
}

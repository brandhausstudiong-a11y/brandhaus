import Cart from '@/components/Cart';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | OUTFITZ by Toju",
  description:
    "Review the items in your cart and proceed to secure checkout.",

  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {

  return (
    <div className='w-full mb-20'>
      <Cart />
    </div>
  )
}

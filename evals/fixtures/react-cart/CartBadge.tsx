'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { selectCount, useCart } from './cart-store'

export function CartBadge() {
  const count = useCart(selectCount)

  return (
    <Link href="/carrito" aria-label="Carrito" className="relative inline-flex">
      <ShoppingBag size={22} />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white">
          {count}
        </span>
      ) : null}
    </Link>
  )
}

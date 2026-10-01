'use client'

import { useCart } from './cart-store'

type Props = {
  variantId: string
  name: string
  imageUrl: string
}

export function AddToCartButton({ variantId, name, imageUrl }: Props) {
  const add = useCart((s) => s.add)

  return (
    <button
      type="button"
      className="w-full bg-black py-4 text-white"
      onClick={() => add({ variantId, name, imageUrl })}
    >
      Agregar al carrito
    </button>
  )
}

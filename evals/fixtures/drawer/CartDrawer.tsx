'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCartUi } from './cart-ui-store'
import { CartLines } from './CartLines'

export function CartDrawer() {
  const { isOpen, close } = useCartUi()
  const pathname = usePathname()

  // Close when the route changes.
  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="veil"
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.1 } }}
            onClick={close}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label="Carrito"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34 }}
          >
            <button type="button" onClick={close}>Cerrar</button>
            <CartLines />
            <a href="/carrito">Ver carrito completo</a>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

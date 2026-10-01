import { create } from 'zustand'

type Line = { variantId: string; name: string; imageUrl: string; quantity: number }

type CartState = {
  lines: Line[]
  add: (line: Omit<Line, 'quantity'>) => void
}

export const useCart = create<CartState>((set) => ({
  lines: [],
  add: (line) =>
    set((state) => {
      const existing = state.lines.find((l) => l.variantId === line.variantId)
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.variantId === line.variantId ? { ...l, quantity: l.quantity + 1 } : l,
          ),
        }
      }
      return { lines: [...state.lines, { ...line, quantity: 1 }] }
    }),
}))

export const selectCount = (state: CartState) =>
  state.lines.reduce((sum, line) => sum + line.quantity, 0)

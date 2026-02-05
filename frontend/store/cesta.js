import { defineStore } from 'pinia'
import { getCart, saveCart, clearCart, migrateOldCart } from '../utils/cartUtils.js'

// Pinia store for the shopping cart (cesta)
export const useCestaStore = defineStore('cesta', {
  state: () => ({
    items: getCart() || []
  }),
  getters: {
    totalItems: (state) => state.items.reduce((s, it) => s + (it.cantidad || 1), 0),
    subtotal: (state) => state.items.reduce((s, it) => s + ((it.precio || 0) * (it.cantidad || 1)), 0),
    totalPrice: (state) => {
      const sub = state.items.reduce((s, it) => s + ((it.precio || 0) * (it.cantidad || 1)), 0)
      const iva = sub * 0.21
      return sub + iva
    }
  },
  actions: {
    init() {
      // Migrate old cart (if any) and refresh
      migrateOldCart()
      this.items = getCart() || []
    },
    save() {
      saveCart(this.items)
      // notify other tabs and listeners
      window.dispatchEvent(new Event('cartUpdated'))
    },
    addProducto(product) {
      // product should include id, precio, marca, modelo, cantidad (optional), stockDisponible
      const existente = this.items.find(i => i.id === product.id)
      if (existente) {
        const nuevaCantidad = (existente.cantidad || 1) + (product.cantidad || 1)
        if (product.stockDisponible && nuevaCantidad > product.stockDisponible) {
          return { ok: false, message: 'Stock insuficiente' }
        }
        existente.cantidad = nuevaCantidad
      } else {
        const toAdd = {
          id: product.id,
          matricula: product.matricula,
          marca: product.marca,
          modelo: product.modelo,
          anio: product.anio,
          kilometros: product.kilometros,
          precio: product.precio,
          imagen: product.imagen,
          tipo: product.tipo,
          cantidad: product.cantidad || 1,
          stockDisponible: product.stockDisponible || product.stock || 0
        }
        this.items.push(toAdd)
      }
      this.save()
      return { ok: true }
    },
    removeProducto(id) {
      this.items = this.items.filter(i => i.id !== id)
      this.save()
    },
    incrementar(id) {
      const it = this.items.find(i => i.id === id)
      if (!it) return
      const nueva = (it.cantidad || 1) + 1
      if (it.stockDisponible && nueva > it.stockDisponible) return { ok: false, message: 'Stock insuficiente' }
      it.cantidad = nueva
      this.save()
      return { ok: true }
    },
    decrementar(id) {
      const it = this.items.find(i => i.id === id)
      if (!it) return
      if ((it.cantidad || 1) > 1) {
        it.cantidad = (it.cantidad || 1) - 1
        this.save()
      }
    },
    clearCart() {
      this.items = []
      clearCart()
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }
})

export default useCestaStore

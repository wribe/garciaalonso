<template>
    <div class="container my-4">
        <h2>Ventas</h2>
        <div class="row">
            <div v-for="item in items" :key="item._id" class="col-md-4 mb-3">
                <div class="card h-100">
                    <img :src="item.imagen || '/placeholder.png'" class="card-img-top"
                        style="height:200px;object-fit:cover;">
                    <div class="card-body">
                        <h5 class="card-title">{{ item.marca }} {{ item.modelo }}</h5>
                        <p class="card-text">Año: {{ item.año }} · Km: {{ item.km }}</p>
                        <p class="card-text fw-bold">{{ formatPrice(item.precio) }}</p>
                        <button class="btn btn-sm btn-primary" @click="open(item)">Ver</button>
                        <button class="btn btn-sm btn-success ms-2" @click="addToCart(item)">Añadir cesta</button>
                    </div>
                </div>
            </div>
        </div>

        <ProductModal v-if="modalItem" :item="modalItem" @close="modalItem = null" @add="addToCart" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ProductModal from './ProductoModal.vue'

const items = ref([])
const modalItem = ref(null)

const load = async () => {
    const res = await axios.get('/api/ventas')
    items.value = res.data.data || []
}
onMounted(load)

function open(i) { modalItem.value = i }
function formatPrice(p) { return p ? `${p} €` : '-' }

function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ id: item._id, matricula: item.matricula, marca: item.marca, modelo: item.modelo, año: item.año, precio: item.precio })
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Añadido a la cesta')
}
</script>

<style scoped>
.card-title {
    font-weight: bold;
    text-transform: capitalize;
}
</style>
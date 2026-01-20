<template>
    <div class="container my-4">
        <h2>Cesta</h2>
        <div v-if="!items.length">No hay productos en la cesta.</div>
        <ul class="list-group mb-3">
            <li v-for="(it, idx) in items" :key="idx"
                class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>{{ it.marca }} {{ it.modelo }}</strong><br>
                    Matrícula: {{ it.matricula }} · Año: {{ it.año }}
                </div>
                <div>
                    {{ it.precio }} €
                    <button class="btn btn-sm btn-danger ms-2" @click="remove(idx)">Quitar</button>
                </div>
            </li>
        </ul>
        <div class="d-flex justify-content-between">
            <div><strong>Total: {{ total }} €</strong></div>
            <div>
                <button class="btn btn-secondary" @click="printSelection">Imprimir (5 campos)</button>
                <button class="btn btn-primary ms-2" @click="checkout">Pagar (simulado)</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))
const total = computed(() => items.value.reduce((s, i) => s + (i.precio || 0), 0))

function remove(i) { items.value.splice(i, 1); localStorage.setItem('cart', JSON.stringify(items.value)) }
async function checkout() {
    if (!items.value.length) {
        alert('El carrito está vacío');
        return;
    }
    // Aquí debes obtener los datos del usuario, por ahora usaremos un objeto simulado
    const userData = { dni: '12345678A' } // Simulación: obtener realmente los datos del usuario

    if (!userData || !userData.dni) {
        alert('Faltan datos de usuario');
        return;
    }

    try {
        const res = await axios.post('/api/checkout', {
            items: items.value, // asegúrate de que no está vacío
            user: userData,   // asegúrate de que existe y tiene los campos requeridos
            // ...otros campos necesarios
        })
        alert('Pago simulado realizado. Invoice: ' + res.data.invoice.invoiceId)
        localStorage.removeItem('cart'); items.value = []
    } catch (error) {
        console.error(error.response?.data || error);
        alert(error.response?.data?.message || 'Error en el checkout');
    }
}

async function printSelection() {
    const details = []
    for (const it of items.value.slice(0, 5)) {
        try {
            const r = await axios.get(`/api/print/modelo/${it.id}`)
            details.push(r.data)
        } catch { }
    }
    const w = window.open('', '_blank')
    w.document.write('<pre>' + JSON.stringify(details, null, 2) + '</pre>')
    w.print()
    w.close()
}
</script>
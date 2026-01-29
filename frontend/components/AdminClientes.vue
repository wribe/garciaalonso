<template>
    <div class="container my-4">
        <h2>Panel Clientes (Admin)</h2>
        <div class="input-group mb-3">
            <input v-model="q" class="form-control" placeholder="DNI o móvil..." />
            <button class="btn btn-primary" @click="load(1)">Buscar</button>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Email</th>
                    <th>Móvil</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in clients" :key="c._id">
                    <td>{{ c.nombre }}</td>
                    <td>{{ c.dni }}</td>
                    <td>{{ c.email }}</td>
                    <td>{{ c.movil }}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" @click="edit(c)">Editar</button>
                        <button class="btn btn-sm btn-danger ms-2" @click="baja(c)">Dar baja</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <nav>
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: page <= 1 }"><a class="page-link"
                        @click.prevent="load(page - 1)">Anterior</a></li>
                <li class="page-item"><a class="page-link">P. {{ page }}</a></li>
                <li class="page-item"><a class="page-link" @click.prevent="load(page + 1)">Siguiente</a></li>
            </ul>
        </nav>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
const clients = ref([])
const page = ref(1)
const limit = 10
const q = ref('')

async function load(p = 1) {
    try {
        const token = sessionStorage.getItem('token')
        const res = await axios.get('/api/clientes-json', { params: { q: q.value, page: p, limit }, headers: { Authorization: token ? `Bearer ${token}` : '' } })
        clients.value = res.data.data || []
        page.value = res.data.page || p
    } catch (err) { console.error(err) }
}

function edit(c) {
    const name = prompt('Nombre:', c.nombre)
    if (!name) return
    const token = sessionStorage.getItem('token')
    axios.put(`/api/clientes-json/${c.id}`, { nombre: name }, { headers: { Authorization: token ? `Bearer ${token}` : '' } }).then(() => load(page.value))
}

function baja(c) {
    if (!confirm('Dar de baja?')) return
    const token = sessionStorage.getItem('token')
    axios.delete(`/api/clientes-json/${c.id}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } }).then(() => load(page.value))
}

load()
</script>
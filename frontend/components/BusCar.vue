<template>
  <div class="container my-4">
    <h2>Buscar</h2>
    <div class="input-group mb-3">
      <input v-model="q" type="text" class="form-control" placeholder="DNI, matrícula, móvil, texto..." />
      <button class="btn btn-primary" @click="search">Buscar</button>
    </div>
    <div v-if="results.length">
      <h5>Resultados</h5>
      <ul class="list-group">
        <li v-for="r in results" :key="r._id" class="list-group-item">{{ r._type || 'item' }} - {{ r._label || r.nombre
          || r.matricula || JSON.stringify(r) }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
const q = ref('')
const results = ref([])

async function search() {
  results.value = []
  try {
    const r1 = await axios.get('/api/clientes', { params: { q: q.value, page: 1, limit: 10 }, headers: { Authorization: sessionStorage.getItem('token') ? `Bearer ${sessionStorage.getItem('token')}` : '' } })
    if (r1.data && r1.data.data) {
      results.value.push(...r1.data.data.map(x => ({ ...x, _type: 'cliente', _label: x.nombre || x.dni })))
    }
  } catch { }
  try {
    const r2 = await axios.get('/api/modelos/buscar', { params: { matricula: q.value } })
    if (r2.data) results.value.push({ ...r2.data, _type: 'modelo', _label: r2.data.matricula })
  } catch { }
}
</script>

<style scoped>
.container {
  max-width: 800px;
}

h2 {
  color: #0d6efd;
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item:hover {
  background-color: #f1f1f1;
}
</style>
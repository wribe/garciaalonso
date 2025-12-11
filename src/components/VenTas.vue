<template>

    <div class="container-fluid mt-2">
        <div class="row g-4">
            <div>
                <div class="card h-80 shadow-sm">
                    <img :src="urlImagen(car.imagen)" class="card-img-top" alt="vehículo" style="height: 200px; object-fit: cover;"/>
                    <div class="card-body">
                        <h5 class="card-title">{{ car.marca }} {{ car.modelo }}</h5>
                        <p class="card-text">
                            <strong>Año: {{ car.anio }}</strong><br>
                            <strong>Km: </strong> {{ car.kilometros }} km<br>
                            <strong>Precio: </strong> {{ car.precio }} €<br>
                        </p>
                    </div>

                    <div class="card-footer text-end bg-white">
                        <span class="badge bg-primary ">{{ car.estado }}</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getArticulos } from '@/api/articulos.js'

const vahiculos = ref([])

onMounted(async () => {

    const data = await getArticulos()
    vahiculos.value = data
})

const urlImagen = (ruta) => {
    if (!ruta) {
        return '/src/assets/HelloKitty.png' // Imagen por defecto si no hay ruta
    } 
    return `http://localhost:5000${ruta}`
}

</script>
<style scoped>
.card-tittle {
    font-weight: bold;
    text-transform: capitalize;
}
</style>
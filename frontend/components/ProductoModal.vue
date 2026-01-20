<template>
    <div class="modal-backdrop show"
        style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;">
        <div class="card p-3" style="width:600px;">
            <div class="d-flex justify-content-between">
                <h5>{{ item.marca }} {{ item.modelo }}</h5>
                <button class="btn-close" @click="$emit('close')"></button>
            </div>
            <img :src="item.imagen || '/placeholder.png'" class="img-fluid my-2"
                style="max-height:300px;object-fit:cover;">
            <p>Año: {{ item.año }} · Km: {{ item.km }}</p>
            <p>Precio: {{ item.precio }} €</p>
            <p>Matrícula: {{ item.matricula }}</p>
            <div class="text-end">
                <button class="btn btn-success" @click="add">Añadir cesta</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ item: Object })
const emit = defineEmits(['close', 'add'])
function add() { emit('add', props.item); emit('close') }
</script>
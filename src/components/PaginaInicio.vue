<template>
    <div div class="d-flex justify-content-center align-items-center mt-5 w-100">
        <transition name="fade" mode="out-in">
            <img :src="imagenes[indice]" :key="imagenes[indice]" class="imagen d-block mx-auto" alt="Imagen animada" />
        </transition>
    </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import imagen1 from '../assets/foto1.webp'
import imagen2 from '../assets/foto2.webp'
import imagen3 from '../assets/foto3.webp'

const imagenes = [imagen1, imagen2, imagen3]
const indice = ref(0)
let intervalo = null

onMounted(() => {
    intervalo = setInterval(() => {
        indice.value = (indice.value + 1) % imagenes.length
    }, 4000)
})

onUnmounted(() => clearInterval(intervalo))
</script>

<style scoped>
.imagen {
    width: 80%;
    height: auto;
    object-fit: cover;
    border-radius: 10px;
}

/* clases propias de Vue */
.fade-enter-active {
    transition: opacity 2s ease;
}

.fade-leave-active {
    transition: opacity 2s ease;
}

.fade-enter-from {
    opacity: 0;
}

.fade-leave-to {
    opacity: 0;
}
</style>



<!--<template>
    <main class="monster-high">
        <section class="intro">
            <h2>¡Bienvenida al Instituto del Terror!</h2>
            <p>
                Conoce a tus monstruo-amigas favoritas y únete al mundo más espeluznante
                y fabuloso del colegio. 💋💀✨
            </p>
        </section>
        <section>
            <!--<img src="../assets/monster-high.gif" alt="MH">
        </section>
    </main>
</template>

<script setup>



</script>

<style scoped>
/* img[alt="MH"]{
    width: 500px;
    height: 500px;
}

.monster-high {
    text-align: center;
    padding: 3rem 1.5rem;
    background: radial-gradient(circle at center, #1a001f, #0b0014 80%);
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
    box-shadow: inset 0 0 80px rgba(255, 0, 255, 0.2);
    font-family: "Poppins", sans-serif;
}

/* --- INTRO --- */
/*
.intro {
    max-width: 700px;
    margin: 0 auto 3rem;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.5);
    border: 3px solid #e91e63;
    border-radius: 20px;
    box-shadow: 0 0 25px #ff5ebc;
    /*animation: pulse 5s ease-in-out infinite alternate;*/
/*}*/
/*

@keyframes pulse {
    from {
        box-shadow: 0 0 25px #ff5ebc, 0 0 50px #6f00ff;
    }

    to {
        box-shadow: 0 0 40px #ff9ee3, 0 0 80px #00fff9;
    }
}

.intro h2 {
    font-family: "Nosifer", cursive;
    font-size: 2.5rem;
    color: #ff5ebc;
    text-shadow: 0 0 15px #ff80c0, 0 0 30px #00fff9;
    margin-bottom: 1rem;
}

.intro p {
    font-size: 1.1rem;
    color: #f5d6ff;
    text-shadow: 0 0 8px #b03cff;
    line-height: 1.6;
} 
img[alt="MH"] {
    width: 500px;
    height: 500px;
    z-index: 2;
    position: relative;
}*/

/* 💀 Fondo principal + capa del gif 💅 */
.monster-high {
    position: relative;
    text-align: center;
    padding: 3rem 1.5rem;
    min-height: 100vh;
    overflow: hidden;
    color: #fff;
    font-family: "Poppins", sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    /* Fondo base gótico 
    background: radial-gradient(circle at center, #1a001f, #0b0014 80%);
    box-shadow: inset 0 0 80px rgba(255, 0, 255, 0.2);*/
    /* Subimos el texto al centro-superior */
  justify-content: flex-start; /* en lugar de center */
  padding-top: 5rem; /* controla la distancia desde arriba */

    /* Fondo base */
    background: radial-gradient(circle at center, #1a001f, #0b0014 80%);
    box-shadow: inset 0 0 80px rgba(255, 0, 255, 0.2);
}

/* --- Capa extra con el gif --- */
.monster-high::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("../assets/monster-high.gif") center center no-repeat;
    background-size: 40%;
    /* 👈 tamaño más pequeño */
    opacity: 0.3;
    /* 👈 para que no opaque el fondo principal */
    animation: floatGif 8s ease-in-out infinite alternate;
    z-index: 0;
    /* detrás del contenido */
}

@keyframes floatGif {
    0% {
        transform: translateY(0) scale(1);
        opacity: 0.25;
    }

    50% {
        transform: translateY(-10px) scale(1.05);
        opacity: 0.4;
    }

    100% {
        transform: translateY(0) scale(1);
        opacity: 0.3;
    }
}

/* --- INTRO --- */
.intro {
    position: relative;
    z-index: 2;
    /* sobre el gif */
    max-width: 700px;
    margin: 0 auto 3rem;
    padding: 2rem;
    background: rgba(0, 0, 0, 0.6);
    border: 3px solid #e91e63;
    border-radius: 20px;
    box-shadow: 0 0 25px #ff5ebc;
}

.intro h2 {
    font-family: "Nosifer", cursive;
    font-size: 2.5rem;
    color: #ff5ebc;
    text-shadow: 0 0 15px #ff80c0, 0 0 30px #00fff9;
    margin-bottom: 1rem;
}

.intro p {
    font-size: 1.1rem;
    color: #f5d6ff;
    text-shadow: 0 0 8px #b03cff;
    line-height: 1.6;
}
</style>-->
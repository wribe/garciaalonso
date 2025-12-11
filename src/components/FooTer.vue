<template>
    <footer class="navbar navbar-dark bg-primary position-sticky top-0">
      <div class="container">
        <!--<p class="mb-1">&copy; {{ new Date().getFullYear() }} MiSitio. Todos los derechos reservados.</p>-->
        <ul class="list-inline mb-0">
          <router-link to="/avisolegal" target="_blank" class="text-light text-decoration-none">Aviso legal</router-link>
          <router-link to="/politicaprivacidad" target="_blank" class="text-light text-decoration-none">Política de privacidad </router-link>
          <router-link to="/contacto" class="text-light text-decoration-none">Contacto</router-link>
        </ul>
        <p class="mb-1">&copy; {{ new Date().getFullYear() }}EmpresaTeis</p>
        <ul class="list-inline mb-0">
      </ul>
      </div>
    </footer>
  </template>
  
  <script setup>


</script>
  
<style scoped>
  footer{
    color: white;
  }
</style>
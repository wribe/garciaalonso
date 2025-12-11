import NotFound from "../components/NotFound.vue"
import PaginaInicio from "../components/PaginaInicio.vue"
import GestionClientes from "../components/GestionClientes.vue"
import NoTicias from "../components/NoTicias.vue"   
import { createRouter, createWebHistory } from "vue-router"
import PoliticaPrivacidad from "../components/PoliticaPrivacidad.vue"
import AvisoLegal from "../components/AvisoLegal.vue"
import ModeLos from "../components/ModeLos.vue"
import CitasTaller from "../components/CitasTaller.vue"
import TablaLogin from "../components/TablaLogin.vue"
import {esAdmin} from "@/api/authApi.js"
import ContacTo from "../components/ContacTo.vue"

const routes = [
    {
        path: '/',
        name: 'Inicio',
        component: PaginaInicio
    },
    {
        path: '/clientes',
        name: 'GestionClientes',
        component: GestionClientes
    },
    {
        path: '/noticias',
        name: 'NoTicias',
        component: NoTicias
    },
    {
        path: '/avisolegal',
        name: 'AvisoLegal',
        component: AvisoLegal
    },
    {
        path: '/politicaprivacidad',
        name: 'PoliticaPrivacidad',
        component: PoliticaPrivacidad
    },
    {
        path: '/modelos',
        name: 'ModeLos',
        component: ModeLos
    },
    {
        path: '/login',
        name: 'Login',
        component: TablaLogin
    },
    {
        path: '/citas',
        name: 'CitasTaller',
        component: CitasTaller
    },
    {
        path: '/contacto',
        name: 'ContacTo',
        component: ContacTo
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const token = sessionStorage.getItem("token");

    // Si la ruta requiere ser admin
    if (to.meta.requiresAdmin) {

        // Si no hay token → al login
        if (!token) return next({ name: "Login" });

        // Consultar al backend si es admin
        const admin = await esAdmin();

        if (!admin) {
            return next({ name: "Inicio" }); // acceso denegado
        }
    }

    next();
});

export default router
import NotFound from "../../frontend/components/NotFound.vue"
import PaginaInicio from "../../frontend/components/PaginaInicio.vue"
import GestionClientes from "../../frontend/components/GestionClientes.vue"
import NoTicias from "../../frontend/components/NoTicias.vue"   
import { createRouter, createWebHistory } from "vue-router"
import PoliticaPrivacidad from "../../frontend/components/PoliticaPrivacidad.vue"
import AvisoLegal from "../../frontend/components/AvisoLegal.vue"
import ModeLos from "../../frontend/components/ModeLos.vue"
import CitasTaller from "../../frontend/components/CitasTaller.vue"
import TablaLogin from "../../frontend/components/TablaLogin.vue"
//import {esAdmin} from "@/api/authApi.js"
import ContacTo from "../../frontend/components/ContacTo.vue"
import Ventas from '../../frontend/components/VenTas.vue'
import ResultadosBusqueda from '../../frontend/components/ResultadosBusqueda.vue'
import Cart from '../../frontend/components/Cart.vue'
import AdminClientes from '../../frontend/components/AdminClientes.vue'
import TablaSuccess from '../../frontend/components/TablaSuccess.vue'
import TablaCancel from '../../frontend/components/TablaCancel.vue'
import ReservaVehiculo from '../../frontend/components/ReservaVehiculo.vue'
import AdminReservas from '../../frontend/components/AdminReservas.vue'

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
    },
    { path: '/ventas', name: 'Ventas', component: Ventas },
    { path: '/buscar', name: 'ResultadosBusqueda', component: ResultadosBusqueda },
    { path: '/cart', name: 'Cart', component: Cart },
    { path: '/tabla-success', name: 'TablaSuccess', component: TablaSuccess },
    { path: '/tabla-cancel', name: 'TablaCancel', component: TablaCancel },
    { path: '/reservar', name: 'ReservaVehiculo', component: ReservaVehiculo },
    { path: '/admin/reservas', name: 'AdminReservas', component: AdminReservas, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/admin/clientes', name: 'AdminClientes', component: AdminClientes },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const token = sessionStorage.getItem('token');
    if (to.meta.requiresAuth) {
        if (!token) {            
            return next("/login");
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/check-admin", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            if (to.meta.requiresAdmin && data.tipo !== "admin") {                
                return next("/");
            }
            return next()
        }
        catch (err) {
            console.error("Token invalido: ", err);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userName');
            return next("/login");
        }

    }
    return next();
})


export default router;
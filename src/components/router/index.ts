import { createRouter, createWebHistory, RouteRecordRaw, RouterScrollBehavior } from 'vue-router'
import { authService } from '@/services/AuthService'

interface RouteMeta {
    requiresAuth?: boolean
    role?: 'owner' | 'instructor' | 'customer'
    title?: string
}

type AppRouteRecord = Omit<RouteRecordRaw, 'meta'> & {
    meta?: RouteMeta
}

const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    return { top: 0 }
}

const routes: AppRouteRecord[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/components/views/HomeView.vue'),
        meta: { title: 'Home - Kitesurfschool Windkracht-12' }
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('@/components/views/AboutUs.vue'),
        meta: { title: 'Over Ons - Kitesurfschool Windkracht-12' }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/components/views/LoginView.vue'),
        meta: {
            title: 'Inloggen - Kitesurfschool Windkracht-12',
            requiresAuth: false
        }
    },
    {
        path: '/wachtwoord-vergeten',
        name: 'ForgotPassword',
        component: () => import('@/components/views/ForgotPasswordView.vue'),
        meta: {
            title: 'Wachtwoord Vergeten - Kitesurfschool Windkracht-12',
            requiresAuth: false
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/components/views/RegisterView.vue'),
        meta: {
            title: 'Registreren - Kitesurfschool Windkracht-12'
        }
    },
    {
        path: '/voordelen',
        name: 'Benefits',
        component: () => import('@/components/views/Benefits.vue'),
        meta: { title: 'Voordelen - Kitesurfschool Windkracht-12' }
    },
    {
        path: '/contact',
        name: 'Contact',
        component: () => import('@/components/views/Contact.vue'),
        meta: { title: 'Contact - Kitesurfschool Windkracht-12' }
    },
    {
        path: '/eigenaar/dashboard',
        name: 'AdminDashboard',
        component: () => import('@/components/views/AdminDashboardView.vue'),
        meta: {
            requiresAuth: true,
            role: 'owner',
            title: 'Eigenaar Dashboard - Kitesurfschool Windkracht-12'
        }
    },
    {
        path: '/instructeur/dashboard',
        name: 'InstructorDashboard',
        component: () => import('@/components/views/InstructorDashboardView.vue'),
        meta: {
            requiresAuth: true,
            role: 'instructor',
            title: 'Instructeur Dashboard - Kitesurfschool Windkracht-12'
        }
    },
    {
        path: '/klant/dashboard',
        name: 'KlantDashboard',
        component: () => import('@/components/views/KlantDashboard.vue'),
        meta: {
            requiresAuth: true,
            role: 'customer',
            title: 'Klant Dashboard - Kitesurfschool Windkracht-12'
        }
    },
    {
        path: '/locations',
        name: 'Locations',
        component: () => import('@/components/views/LocationsView.vue'),
        meta: { title: 'Locaties - Kitesurfschool Windkracht-12' }
    },
    {
        path: '/pakketten',
        name: 'Packages',
        component: () => import('@/components/views/PackagesView.vue'),
        meta: { title: 'Pakketten - Kitesurfschool Windkracht-12' }
    },
    {
        path: '/reserveren',
        name: 'Reservations',
        component: () => import('@/components/views/ReservationsView.vue'),
        meta: {
            requiresAuth: true,
            role: 'customer',
            title: 'Reserveren - Kitesurfschool Windkracht-12'
        }
    },
    {
        path: '/profiel',
        name: 'Profile',
        component: () => import('@/components/views/ProfileView.vue'),
        meta: {
            requiresAuth: true,
            title: 'Mijn Profiel - Kitesurfschool Windkracht-12'
        }
    },
    {
        path: '/weer',
        name: 'Weather',
        component: () => import('@/components/views/WeatherView.vue'),
        meta: { title: 'Weer - Kitesurfschool Windkracht-12' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/components/views/NotFoundView.vue'),
        meta: { title: '404 - Pagina Niet Gevonden' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes as RouteRecordRaw[],
    scrollBehavior
})

router.beforeEach(async (to, from, next) => {
    document.title = to.meta?.title || 'Kitesurfschool Windkracht-12'

    const requiresAuth = to.matched.some(record => record.meta?.requiresAuth)
    const requiredRole = to.matched.find(record => record.meta?.role)?.meta?.role

    if (requiresAuth && !authService.isAuthenticated()) {
        next({
            path: '/login',
            query: {
                redirect: to.fullPath,
                message: 'Je moet ingelogd zijn om deze pagina te bekijken'
            }
        })
        return
    }

    if (requiredRole && !authService.hasRole(requiredRole)) {
        const currentRole = authService.getUserRole()
        const redirectPath = currentRole === 'owner' ? '/eigenaar/dashboard' :
            currentRole === 'instructor' ? '/instructeur/dashboard' :
                currentRole === 'customer' ? '/klant/dashboard' : '/login'

        next({
            path: redirectPath,
            query: {
                error: 'unauthorized',
                message: 'Je hebt geen toegang tot deze pagina'
            }
        })
        return
    }

    next()
})

export default router
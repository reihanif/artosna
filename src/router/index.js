/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes as autoRoutes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/stores/auth'
import { detectDeviceType } from '@/utils/detectDeviceType'

function setRoutes (routes, parentPath = '') {
  for (const route of routes) {
    const fullPath = route.path.startsWith('/')
      ? route.path
      : `${parentPath.replace(/\/$/, '')}/${route.path}`

    let name = fullPath.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-')

    if (route.path === '') {
      const parentName = parentPath.replace(/^\//, '').replace(/\//g, '-')
      name = parentName ? `${parentName}-index` : 'index'
    }

    route.name = name || 'home'

    if (route.children && route.children.length > 0) {
      setRoutes(route.children, fullPath)
    }

    // Setting up base layout
    route.meta = {
      ...(route.meta),
      layout: setLayout(route, fullPath),
    }
  }

  return routes
}

function setLayout (route, fullPath) {
  let layout

  if (fullPath.startsWith('/app')) {
    layout = 'app'
  } else if (fullPath.startsWith('/mobile')) {
    layout = 'mobile'
  } else if (['/login', '/register', '/forgot-password', '/auth/reset-password'].includes(fullPath)) {
    layout = 'auth'
  } else {
    layout = 'home'
  }

  return layout
}

const routes = setRoutes(autoRoutes)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const deviceType = detectDeviceType()

  // Initialize auth on first navigation
  if (!authStore.initialized) {
    await authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  const protectedRoutes = ['/app', '/mobile']
  const guestOnlyRoutes = ['/login', '/register', '/forgot-password']
  const desktopOnlyRoutes = ['/app']
  const mobileOnlyRoutes = ['/mobile']

  // Check if path matches routes
  const matchesRoute = (path, routes) => {
    return routes.some(route => path === route || path.startsWith(`${route}/`))
  }

  const isProtectedRoute = matchesRoute(to.path, protectedRoutes)
  const isGuestOnlyRoute = guestOnlyRoutes.includes(to.path)
  const isDesktopOnlyRoute = matchesRoute(to.path, desktopOnlyRoutes)
  const isMobileOnlyRoute = matchesRoute(to.path, mobileOnlyRoutes)
  const isPhone = deviceType === 'phone'

  // Handle root path redirect
  if (to.path === '/' && isAuthenticated) {
    next({ path: isPhone ? '/mobile' : '/app' })
    return
  }

  // Redirect to login if route requires auth and user is not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Redirect authenticated users away from guest-only routes
  if (isGuestOnlyRoute && isAuthenticated) {
    next({ path: isPhone ? '/mobile' : '/app' })
    return
  }

  // Handle device-specific route restrictions
  if (isDesktopOnlyRoute && isPhone) {
    next({ path: '/mobile' })
    return
  }

  if (isMobileOnlyRoute && !isPhone) {
    next({ path: '/app' })
    return
  }

  next()
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router

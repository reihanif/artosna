<script setup>
  import { onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useTheme } from 'vuetify'
  import AppLayout from '@/layouts/AppLayout.vue'
  import { useAuthStore } from '@/stores/auth'
  import AuthLayout from './layouts/AuthLayout.vue'
  import HomeLayout from './layouts/HomeLayout.vue'
  import MobileLayout from './layouts/MobileLayout.vue'

  const authStore = useAuthStore()

  onMounted(async () => {
    // Initialize authentication when app loads
    await authStore.initializeAuth()
  })

  const route = useRoute()

  const theme = useTheme()

  const layouts = {
    app: AppLayout,
    auth: AuthLayout,
    home: HomeLayout,
    mobile: MobileLayout,
  }

  function getLayout () {
    return layouts[route.meta.layout] || layouts.default
  }

  watch(
    () => theme.name.value,
    newTheme => {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
      document.documentElement.classList.toggle('light', newTheme === 'light')
      localStorage.setItem('theme', newTheme)
    },
    { immediate: true },
  )
</script>

<template>
  <div>
    <app-toast />
    <component :is="getLayout()">
      <router-view />
    </component>
    <app-confirmation />
  </div>
</template>

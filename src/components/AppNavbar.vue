<script setup>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { useDeviceType } from '@/composables/useDeviceType'
  import { useToasts } from '@/composables/useToasts'
  import router from '@/router'
  import { useAuthStore } from '@/stores/auth'

  const props = defineProps({
    variant: {
      type: String,
      default: 'home',
      validator: value => ['home', 'auth', 'admin'].includes(value),
    },
    sidebarToggle: {
      type: Boolean,
      default: true,
    },
    authButton: {
      type: Boolean,
      default: true,
    },
    logoPosition: {
      type: String,
      default: 'left',
      validator: value => ['left', 'center', 'right'].includes(value),
    },
  })
  const emit = defineEmits(['click:navicon'])

  const authStore = useAuthStore()
  const toast = useToasts()
  const route = useRoute()
  const theme = useTheme()

  const { isMobile } = useDeviceType()

  const themeValue = ref(theme.name.value)

  const menuItems = computed(() => {
    return [
      ...(route.meta.layout === 'home' ? [{ text: 'Apps', icon: 'mdi-apps', action: '/app' }] : []),
      { text: 'Profile', icon: 'mdi-account-outline', action: '/app/profile' },
      { text: 'Reset Password', icon: 'mdi-lock-reset', action: '/auth/reset-password' },
      { text: 'Logout', icon: 'mdi-logout', action: 'logout' },
    ]
  })

  function handleMenuClick (action) {
    if (action === 'logout') {
      handleLogout()
      return
    }
    router.push(action)
  }

  function handleLogoClick () {
    router.push('/')
  }

  async function handleLogout () {
    const success = await authStore.logout()

    if (success) {
      toast.push('You have logged out', { color: 'success' })
      await router.push('/login')
    }
  }
</script>

<template>
  <v-app-bar :elevation="0" :height="isMobile ? 48 : 64">
    <template v-if="props.sidebarToggle" #prepend>
      <v-app-bar-nav-icon @click.stop="emit('click:navicon')" />
    </template>

    <v-app-bar-title
      class="ms-1 sm:ms-4 m-0"
      :class="{
        'text-left': props.logoPosition === 'left',
        'text-center': props.logoPosition === 'center',
        'text-right': props.logoPosition === 'right',
      }"
    >
      <app-logo class="cursor-pointer" :size="isMobile ? 'small' : 'default'" @click="handleLogoClick" />
    </v-app-bar-title>

    <div v-if="props.authButton" class="me-4">
      <template v-if="authStore.isAuthenticated">
        <v-btn icon>
          <v-avatar>
            <v-img
              alt="avatar"
              :src="`https://ui-avatars.com/api/?name=${authStore.user?.user_metadata.display_name}&format=svg&background=E8EAF6`"
            />
          </v-avatar>
          <v-menu activator="parent" :close-on-content-click="false" min-width="200px">
            <v-card class="shadow-2xl">
              <v-card-text>
                <div class="mx-auto text-center">
                  <h3 class="font-semibold">{{ authStore.user?.user_metadata.display_name }}</h3>
                  <p class="text-caption text-primary-500 mt-1">
                    {{ authStore.user.email }}
                  </p>
                </div>
                <div class="mt-4 flex justify-center">
                  <v-btn-toggle
                    v-model="themeValue"
                    color="primary"
                    density="compact"
                    mandatory
                    variant="outlined"
                  >
                    <v-btn value="dark" @click="theme.change('dark')">
                      <v-icon icon="mdi-weather-night" />
                    </v-btn>

                    <v-btn value="light" @click="theme.change('light')">
                      <v-icon icon="mdi-white-balance-sunny" />
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </v-card-text>
              <v-list
                density="compact"
                :lines="false"
                nav
              >
                <v-list-item
                  v-for="(item, index) in menuItems"
                  :key="index"
                  class="text-primary-700"
                  :value="item"
                >
                  <div class="flex items-center gap-2" :class="{ 'text-red-500': index + 1 === menuItems.length }" @click="handleMenuClick(item.action)">
                    <v-icon :icon="item.icon" />
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </div>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-btn>
      </template>
      <template v-else>
        <div class="space-x-2">
          <v-btn color="primary" variant="outlined" :width="100" @click="router.push('/login')">
            Login
          </v-btn>
          <v-btn
            class="hidden sm:inline-block"
            color="primary"
            variant="flat"
            :width="100"
            @click="router.push('/register')"
          >
            Register
          </v-btn>
        </div>
      </template>
    </div>
  </v-app-bar>
</template>

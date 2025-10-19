<script setup>
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { useConfirmation } from '@/composables/useConfirmation'
  import { useToasts } from '@/composables/useToasts'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()
  const theme = useTheme()
  const toast = useToasts()
  const confirmation = useConfirmation()

  const themeValue = ref(theme.name.value)

  const manageItems = reactive([
    {
      title: 'Profile',
      icon: 'mdi-account-outline',
      route: '/mobile/profile',
    },
    {
      title: 'Manage Categories',
      icon: 'mdi-format-list-group',
      route: '/mobile/categories',
    },
    {
      title: 'Manage Wallets',
      color: 'red',
      icon: 'mdi-wallet-outline',
      route: '/mobile/wallets',
    },
    {
      title: 'Reset Password',
      icon: 'mdi-lock-reset',
      route: '/auth/reset-password',
    },
  ])

  async function handleLogout () {
    try {
      await confirmation.open({
        title: 'Logout',
        message: `Are you sure you want to logout?`,
        confirm: {
          label: 'Logout',
          color: 'red',
          variant: 'outlined',
        },
        cancel: {
          label: 'Cancel',
          variant: 'flat',
        },
      })

      const success = await authStore.logout()

      if (success) {
        toast.push('You have logged out', { color: 'success' })
        await router.push('/login')
      }
    } catch (error) {
      return { success: false, error }
    } finally {
      confirmation.close()
    }
  }
</script>

<template>
  <div>
    <div class="mb-4">
      <v-card class="rounded-none">
        <v-card-text class="space-y-4">
          <div class="flex justify-center">
            <v-avatar size="x-large">
              <v-img
                alt="avatar"
                :src="`https://ui-avatars.com/api/?name=${authStore.user.email.split('@')[0]}&format=svg&background=E8EAF6`"
              />
            </v-avatar>
          </div>
          <div class="mx-auto text-center">
            <h3 class="font-semibold">{{ authStore.user.user_metadata.display_name }}</h3>
            <p class="text-caption text-primary-500 mt-1">
              {{ authStore.user.email }}
            </p>
          </div>
          <div class="flex justify-center">
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
      </v-card>
    </div>
    <v-list nav>
      <v-list-item
        v-for="(item, itemIndex) in manageItems"
        :key="itemIndex"
        color="primary"
        rounded="lg"
        :value="item"
        @click="router.push(item.route)"
      >
        <template #prepend>
          <v-icon :icon="item.icon" />
        </template>

        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-list-item
        class="text-red-500"
        rounded="lg"
        @click="handleLogout"
      >
        <template #prepend>
          <v-icon icon="mdi-logout" />
        </template>

        <v-list-item-title>Logout</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

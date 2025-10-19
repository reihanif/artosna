<template>
  <v-snackbar
    v-model="showUpdatePrompt"
    color="primary"
    elevation="24"
    location="bottom"
    :timeout="-1"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">
        New version available!
      </span>
    </div>

    <template #actions>
      <v-btn
        size="small"
        variant="text"
        @click="dismissUpdate"
      >
        Later
      </v-btn>
      <v-btn
        color="white"
        size="small"
        variant="text"
        @click="updateApp"
      >
        Update
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
  import { useRegisterSW } from 'virtual:pwa-register/vue'
  import { onMounted, ref } from 'vue'

  const showUpdatePrompt = ref(false)

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered (registration) {
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Check for updates every hour
      }
    },
    onRegisterError (error) {
      console.error('SW registration error', error)
    },
  })

  onMounted(() => {
    if (needRefresh.value) {
      showUpdatePrompt.value = true
    }
  })

  async function updateApp () {
    showUpdatePrompt.value = false
    await updateServiceWorker(true)
  }

  function dismissUpdate () {
    showUpdatePrompt.value = false
    needRefresh.value = false
  }
</script>

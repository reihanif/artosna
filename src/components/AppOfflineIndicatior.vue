<template>
  <v-snackbar
    v-model="showOfflineMessage"
    color="warning"
    location="top"
    :timeout="-1"
  >
    <div class="flex items-center gap-2">
      <v-icon size="small">mdi-wifi-off</v-icon>
      <span class="text-sm font-medium">
        You are currently offline
      </span>
    </div>
  </v-snackbar>

  <v-snackbar
    v-model="showOnlineMessage"
    color="success"
    location="top"
    :timeout="3000"
  >
    <div class="flex items-center gap-2">
      <v-icon size="small">mdi-wifi</v-icon>
      <span class="text-sm font-medium">
        Back online
      </span>
    </div>
  </v-snackbar>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'

  const showOfflineMessage = ref(false)
  const showOnlineMessage = ref(false)
  const wasOffline = ref(false)

  function handleOnline () {
    showOfflineMessage.value = false

    if (wasOffline.value) {
      showOnlineMessage.value = true
      wasOffline.value = false
    }
  }

  function handleOffline () {
    showOfflineMessage.value = true
    wasOffline.value = true
  }

  onMounted(() => {
    showOfflineMessage.value = !navigator.onLine

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
</script>

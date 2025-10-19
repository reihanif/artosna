<template>
  <v-banner
    v-if="showInstallBanner"
    class="fixed bottom-0 left-0 right-0 z-[999]"
    color="primary"
    icon="mdi-tray-arrow-down"
    sticky
  >
    <template #text>
      <div class="text-xs">
        Install this app for a better experience
      </div>
    </template>

    <template #actions>
      <v-btn
        size="small"
        variant="text"
        @click="dismissInstall"
      >
        Not now
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        @click="installApp"
      >
        Install
      </v-btn>
    </template>
  </v-banner>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'

  const showInstallBanner = ref(false)
  const deferredPrompt = ref(null)

  function handleBeforeInstallPrompt (event) {
    event.preventDefault()
    deferredPrompt.value = event

    // Check if user has dismissed the prompt before
    const isDismissed = localStorage.getItem('pwa-install-dismissed')
    if (!isDismissed) {
      showInstallBanner.value = true
    }
  }

  async function installApp () {
    if (!deferredPrompt.value) {
      return
    }

    deferredPrompt.value.prompt()

    const result = await deferredPrompt.value.userChoice

    if (result.outcome === 'accepted') {
      console.log('PWA installed')
    }

    deferredPrompt.value = null
    showInstallBanner.value = false
  }

  function dismissInstall () {
    showInstallBanner.value = false
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  function handleAppInstalled () {
    showInstallBanner.value = false
    deferredPrompt.value = null
    localStorage.removeItem('pwa-install-dismissed')
    console.log('PWA was installed')
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })
</script>

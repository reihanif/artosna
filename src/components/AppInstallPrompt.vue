<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'

  const deferredPrompt = ref(null)

  function handleBeforeInstallPrompt (event) {
    event.preventDefault()
    deferredPrompt.value = event

    // Check if user has dismissed the prompt before
    const isDismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')

    // Show again after 7 days if previously dismissed
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    const shouldShowAgain = dismissedTime && (Date.now() - Number.parseInt(dismissedTime)) > sevenDaysInMs

    if (!isDismissed || shouldShowAgain) {
      showInstallPrompt()
    }
  }

  function showInstallPrompt () {
    const userResponse = confirm(
      'Install this app on your device for a better experience and offline access. Would you like to install?',
    )

    if (userResponse) {
      installApp()
    } else {
      dismissInstall()
    }
  }

  async function installApp () {
    if (!deferredPrompt.value) {
      return
    }

    try {
      deferredPrompt.value.prompt()

      const result = await deferredPrompt.value.userChoice

      if (result.outcome === 'accepted') {
        console.log('PWA installed successfully')
        localStorage.removeItem('pwa-install-dismissed')
        localStorage.removeItem('pwa-install-dismissed-time')
      } else {
        console.log('PWA installation declined')
        dismissInstall()
      }
    } catch (error) {
      console.error('Error during PWA installation:', error)
    } finally {
      deferredPrompt.value = null
    }
  }

  function dismissInstall () {
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
  }

  function handleAppInstalled () {
    deferredPrompt.value = null
    localStorage.removeItem('pwa-install-dismissed')
    localStorage.removeItem('pwa-install-dismissed-time')
    console.log('PWA was installed')

    // Optional: Show success message
    alert('App installed successfully! You can now use it offline.')
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

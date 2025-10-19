import { onMounted, onUnmounted, ref } from 'vue'

export function usePWA () {
  const isOnline = ref(navigator.onLine)
  const isInstalled = ref(false)
  const isStandalone = ref(false)

  const checkInstallStatus = () => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const webkitStandalone = 'standalone' in window.navigator && window.navigator.standalone

    isStandalone.value = standalone || webkitStandalone
    isInstalled.value = isStandalone.value
  }

  const handleOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    checkInstallStatus()

    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnlineStatus)
    window.removeEventListener('offline', handleOnlineStatus)
  })

  return {
    isOnline,
    isInstalled,
    isStandalone,
  }
}

export function useServiceWorker () {
  const isServiceWorkerSupported = ref('serviceWorker' in navigator)
  const registration = ref(null)

  const register = async () => {
    if (!isServiceWorkerSupported.value) {
      console.warn('Service Worker is not supported')
      return null
    }

    try {
      registration.value = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration.value)
      return registration.value
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }

  const unregister = async () => {
    if (!registration.value) {
      return false
    }

    try {
      const result = await registration.value.unregister()
      console.log('Service Worker unregistered:', result)
      return result
    } catch (error) {
      console.error('Service Worker unregistration failed:', error)
      return false
    }
  }

  return {
    isServiceWorkerSupported,
    registration,
    register,
    unregister,
  }
}

export function useNetworkStatus () {
  const isOnline = ref(navigator.onLine)
  const effectiveType = ref(null)
  const downlink = ref(null)
  const rtt = ref(null)

  const updateNetworkInfo = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

    if (connection) {
      effectiveType.value = connection.effectiveType
      downlink.value = connection.downlink
      rtt.value = connection.rtt
    }
  }

  const handleOnlineStatus = () => {
    isOnline.value = navigator.onLine
    updateNetworkInfo()
  }

  onMounted(() => {
    updateNetworkInfo()

    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnlineStatus)
    window.removeEventListener('offline', handleOnlineStatus)

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      connection.removeEventListener('change', updateNetworkInfo)
    }
  })

  return {
    isOnline,
    effectiveType,
    downlink,
    rtt,
  }
}

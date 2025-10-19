import { computed, onMounted, onUnmounted, ref } from 'vue'
import { detectDeviceType } from '@/utils/detectDeviceType'

export function useDeviceType () {
  const deviceType = ref('unknown')

  function updateDeviceType () {
    deviceType.value = detectDeviceType()
  }

  onMounted(() => {
    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDeviceType)
  })

  const isMobile = computed(() => deviceType.value === 'phone')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')

  return { deviceType, isMobile, isTablet, isDesktop }
}

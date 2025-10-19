export function detectDeviceType () {
  if (typeof window === 'undefined') {
    return 'desktop'
  } // SSR-safe fallback

  const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
  const width = Math.min(window.screen.width, window.screen.height)

  if (!hasTouch) {
    return 'desktop'
  }
  if (width < 768) {
    return 'phone'
  }
  if (width < 1280) {
    return 'tablet'
  }
  return 'desktop'
}

export function isTouchDevice () {
  if (typeof window === 'undefined') {
    return false
  }
  return navigator.maxTouchPoints > 0 || 'ontouchstart' in window
}

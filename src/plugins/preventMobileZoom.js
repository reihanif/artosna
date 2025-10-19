export default {
  install () {
    // --- Disable pinch zoom gestures (Safari / Chrome)
    const preventGesture = e => e.preventDefault()
    document.addEventListener('gesturestart', preventGesture)
    document.addEventListener('gesturechange', preventGesture)
    document.addEventListener('gestureend', preventGesture)

    // --- Disable double-tap zoom
    let lastTouchEnd = 0
    document.addEventListener(
      'touchend',
      e => {
        const now = new Date().getTime()
        if (now - lastTouchEnd <= 300) {
          e.preventDefault()
        }
        lastTouchEnd = now
      },
      { passive: false },
    )

    // --- Prevent pull-to-refresh (overscroll bounce)
    const style = document.createElement('style')
    style.textContent = `
      html, body {
        overscroll-behavior-y: contain
        overscroll-behavior-x: none
        touch-action: pan-x pan-y
        height: 100%
      }
    `
    document.head.appendChild(style)

    console.log('[preventMobileZoom] Mobile zoom and pull-to-refresh disabled.')
  },
}

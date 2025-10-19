/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Service Worker
import { registerSW } from 'virtual:pwa-register'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import router from './router'

// Styles
import '@/styles/settings.scss'
import '@/assets/tailwind.css'
import 'unfonts.css'
import 'swiper/css'
import 'swiper/css/effect-cards'

const app = createApp(App)

registerPlugins(app)

// Function to hide splash screen
function hideSplashScreen () {
  const splashScreen = document.querySelector('#splash-screen')
  const appElement = document.querySelector('#app')

  if (splashScreen && appElement) {
    appElement.classList.add('mounted')
    splashScreen.classList.add('fade-out')

    setTimeout(() => {
      splashScreen.remove()
    }, 500)
  }
}

app.mount('#app')

// Register service worker
const updateSW = registerSW({
  onNeedRefresh () {
    // Show a prompt to user for update
    if (confirm('New content available. Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady () {
    console.log('App is ready to work offline')
  },
  onRegistered (registration) {
    console.log('Service Worker registered:', registration)
  },
  onRegisterError (error) {
    console.error('Service Worker registration error:', error)
  },
})

// Wait for router to be ready
router.isReady().then(() => {
  // Hide splash after first route is loaded
  hideSplashScreen()
})

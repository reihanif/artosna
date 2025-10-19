/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import VueApexCharts from 'vue3-apexcharts'
import router from '@/router'
import pinia from './pinia'
import preventMobileZoom from './preventMobileZoom'
import rules from './rules'
import vuetify from './vuetify'

export function registerPlugins (app) {
  app
    .use(pinia)
    .use(router)
    .use(vuetify)
    .use(rules)
    .use(VueApexCharts)
    .use(preventMobileZoom)
}

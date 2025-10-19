/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const savedTheme = localStorage.getItem('theme')
const defaultTheme = savedTheme || 'light'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          'background': '#FFFFFF',
          'surface': '#FFFFFF',
          'primary': '#3F51B5',
          'secondary': '#424242',
          'error': '#c10007',
          'accent': '#82B1FF',
          'info': '#2196F3',
          'success': '#009966',
          'warning': '#FFC107',
          'on-background': '#424242',
          'on-surface': '#424242',
        },
      },
      dark: {
        dark: true,
        colors: {
          'background': '#1F1F1F',
          'surface': '#1F1F1F',
          'primary': '#3F51B5',
          'secondary': '#03DAC6',
          'error': '#c10007',
          'accent': '#82B1FF',
          'info': '#2196F3',
          'success': '#009966',
          'warning': '#FFC107',
          'on-background': '#BDBDBD',
          'on-surface': '#BDBDBD',
        },
      },
    },
  },
  defaults: {
    VDataTable: {
      class: `
        [&_thead_tr_th]:border-none
        [&_thead]:bg-primary-50
        [&_thead]:dark:bg-primary-700
        [&_thead]:text-primary-500
        [&_thead]:dark:text-primary-100
        [&_thead_tr_th:first-child]:rounded-l-md
        [&_thead_tr_th:last-child]:rounded-r-md
        hover:[&_tbody_tr]:bg-gray-50
        dark:hover:[&_tbody_tr]:bg-gray-900
        [&_tbody_tr_td]:border-b
        [&_tbody_tr_td]:border-primary-100
        [&_tbody_tr_td]:dark:border-gray-800
        hover:[&_tr.v-data-table-rows-no-data]:bg-transparent
        dark:hover:[&_tr.v-data-table-rows-no-data]:bg-transparent
        [&_tr.v-data-table-rows-no-data_td]:border-none
        hover:[&_tr.v-data-table-rows-loading]:bg-transparent
        dark:hover:[&_tr.v-data-table-rows-loading]:bg-transparent
        [&_tr.v-data-table-rows-loading_td]:border-none
      `,
      density: 'comfortable',
      colors: 'primary',
      hideDefaultFooter: true,
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VBtn: {
      class: 'text-none tracking-wider',
    },
    VDivider: {
      class: 'dark:border-gray-800',
    },
  },
})

<script setup>
  import { ref } from 'vue'
  import { useTheme } from 'vuetify'

  const theme = useTheme()

  const themeValue = ref(theme.name.value)

  function toggleDarkMode () {
    theme.change('dark')
    themeValue.value = 'dark'
  }

  function toggleLightMode () {
    theme.change('light')
    themeValue.value = 'light'
  }
</script>

<template>
  <v-layout class="bg-gray-50 dark:bg-gray-950">
    <slot />
    <v-fab
      v-if="themeValue === 'dark'"
      app
      elevation="0"
      icon="mdi-white-balance-sunny"
      location="bottom left"
      size="small"
      variant="text"
      @click="toggleLightMode"
    />
    <v-fab
      v-if="themeValue === 'light'"
      app
      elevation="0"
      icon="mdi-weather-night"
      location="bottom left"
      size="small"
      variant="text"
      @click="toggleDarkMode"
    />
  </v-layout>
</template>

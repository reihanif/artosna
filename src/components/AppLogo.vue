<script setup>
  import { computed } from 'vue'
  import { useTheme } from 'vuetify'

  const props = defineProps({
    size: {
      type: String,
      default: () => 'default',
      validator: value => ['small', 'default', 'large'].includes(value),
    },
  })

  const height = computed(() => {
    let result
    switch (props.size) {
      case 'small': {
        result = 20
        break
      }
      case 'default': {
        result = 40
        break
      }
      case 'large': {
        result = 60
        break
      }
    }
    return result
  })

  const width = computed(() => {
    let result
    switch (props.size) {
      case 'small': {
        result = 100
        break
      }
      case 'default': {
        result = 200
        break
      }
      case 'large': {
        result = 300
        break
      }
    }
    return result
  })

  const theme = useTheme()
</script>

<template>
  <div class="inline-block">
    <v-img
      v-if="theme.name.value === 'light'"
      alt="logo"
      :height="height"
      src="@/assets/artosna-logo.svg"
      :width="width"
    />
    <v-img
      v-if="theme.name.value === 'dark'"
      alt="logo"
      :height="height"
      src="@/assets/artosna-logo-white.svg"
      :width="width"
    />
  </div>
</template>

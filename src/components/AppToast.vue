<script setup>
  import { useDeviceType } from '@/composables/useDeviceType'
  import { useToasts } from '@/composables/useToasts'

  const { toasts } = useToasts()

  const { isMobile } = useDeviceType()
</script>

<template>
  <div class="fixed top-0 right-0 sm:top-4 sm:right-4 flex flex-col gap-2 z-[99999]">
    <v-alert
      v-for="toast in toasts"
      :key="toast.id"
      :border="!isMobile ? 'start' : false"
      class="rounded-none sm:rounded-lg shadow-md w-screen sm:w-96"
      :closable="!isMobile"
      :icon-size="isMobile ? 'small' : 'default'"
      prominent
      :type="toast.color"
    >
      <template #text>
        <span class="text-sm sm:text-base">{{ toast.text }}</span>
      </template>
    </v-alert>
  </div>
</template>

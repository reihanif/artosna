<template>
  <v-dialog v-model="confirmationState.isOpen" max-width="500" persistent>
    <v-card rounded="lg">
      <template #title>
        <span class="text-base sm:text-xl">{{ confirmationState.title }}</span>
      </template>
      <v-card-text class="px-6 pb-4">
        <span class="text-sm sm:text-base tracking-normal leading-0.5 sm:leading-6">
          {{ confirmationState.message }}
        </span>
        <v-row class="mt-4">
          <v-col>
            <v-btn
              block
              :color="confirmationState.cancelColor"
              :disabled="confirmationState.loading"
              :size="isMobile ? 'small' : 'default'"
              :variant="confirmationState.cancelVariant"
              @click="handleReject"
            >
              {{ confirmationState.cancelLabel }}
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              block
              :color="confirmationState.confirmColor"
              :loading="confirmationState.loading"
              :size="isMobile ? 'small' : 'default'"
              :variant="confirmationState.confirmVariant"
              @click="handleResolve"
            >
              {{ confirmationState.confirmLabel }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed } from 'vue'
  import { useConfirmation } from '@/composables/useConfirmation'
  import { useDeviceType } from '@/composables/useDeviceType'

  const { state } = useConfirmation()
  const { isMobile } = useDeviceType()

  const confirmationState = computed(() => state.value)

  async function handleResolve () {
    if (confirmationState.value.resolve) {
      try {
        await confirmationState.value.resolve(true)
      } finally {
        console.log('resolved')
      }
    }
  }

  function handleReject () {
    if (confirmationState.value.reject) {
      confirmationState.value.reject(false)
    }
  }
</script>

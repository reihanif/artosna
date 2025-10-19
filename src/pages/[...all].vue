<script setup>
  import { useRouter } from 'vue-router'
  import { useDeviceType } from '@/composables/useDeviceType'

  const router = useRouter()
  const { isMobile } = useDeviceType()

  function handleBackToHomepage () {
    router.push('/')
  }
</script>

<template>
  <section class="bg-white dark:bg-gray-900 h-full flex items-center">
    <div class="pb-8 pt-0 px-4 mx-auto max-w-screen-xl lg:pb-16 lg:pt-0 lg:px-6">
      <div class="mx-auto max-w-screen-sm text-center">
        <div class="p-4">
          <v-img
            alt="404"
            aspect-ratio="1/1"
            class="mx-auto"
            :height="400"
            src="@/assets/illustrations/404.svg"
          />
        </div>
        <p class="mb-4 text-lg sm:text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
          Something's missing.
        </p>
        <p class="mb-4 text-sm sm:text-lg font-light text-gray-500 dark:text-gray-400">Sorry, we can't find that page. You'll find
          lots to explore on the home page. </p>
        <v-btn
          color="primary"
          rounded="lg"
          :size="isMobile ? 'small' : 'default'"
          variant="flat"
          @click="handleBackToHomepage"
        >
          Back to Homepage
        </v-btn>
      </div>
    </div>
  </section>
</template>

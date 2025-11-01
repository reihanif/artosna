<script setup>
  import { useRouter } from 'vue-router'
  import { useDeviceType } from '@/composables/useDeviceType'

  const router = useRouter()
  const { isMobile } = useDeviceType()
</script>

<template>
  <section class="bg-white dark:bg-gray-900 h-full flex items-center">
    <div class="pb-8 pt-0 px-4 mx-auto max-w-screen-xl lg:pb-16 lg:pt-0 lg:px-6">
      <div class="mx-auto max-w-screen-sm text-center">
        <div class="p-4">
          <v-img
            alt="welcome"
            aspect-ratio="1/1"
            class="mx-auto"
            :height="400"
            src="@/assets/illustrations/welcome.svg"
          />
        </div>
        <p class="mb-4 text-lg sm:text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
          Welcome Abroad!
        </p>
        <p class="mb-4 text-sm sm:text-lg font-light text-gray-500 dark:text-gray-400">
          Every great result starts with one step — let’s take it together.
        </p>
        <v-btn
          color="primary"
          rounded="lg"
          :size="isMobile ? 'small' : 'default'"
          variant="flat"
          @click="router.push('/app')"
        >
          Explore Artosna
        </v-btn>
      </div>
    </div>
  </section>
</template>

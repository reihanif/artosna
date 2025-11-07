<script setup>
  import router from '@/router'
</script>

<template>
  <section class="bg-white dark:bg-gray-900">
    <div class="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
      <img alt="dashboard" class="w-full dark:hidden" src="https://artosna.netlify.app/preview.png">
      <img alt="dashboard dark" class="w-full hidden dark:block" src="https://artosna.netlify.app/preview.png">
      <div class="mt-4 md:mt-0">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Your finances, beautifully organized
        </h2>
        <p class="mb-6 font-light text-gray-500 md:text-lg dark:text-gray-400">
          Designed to be calming, focused, and intuitive — Artosna helps you feel in control without the clutter.
        </p>
        <v-btn
          class="text-none !tracking-normal"
          color="primary"
          @click="router.push('login')"
        >
          Get started
          <v-icon class="ml-2 -mr-1" size="20">
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                clip-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                fill-rule="evenodd"
              />
            </svg>
          </v-icon>
        </v-btn>
      </div>
    </div>
  </section>
</template>

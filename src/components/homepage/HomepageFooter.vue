<script setup>
  import router from '@/router'

  function handleLogoClick () {
    router.push('/')
  }
</script>

<template>
  <footer class="p-4 bg-white md:p-8 lg:p-10 dark:bg-gray-800">
    <div class="mx-auto max-w-screen-xl text-center">
      <div class="flex justify-center">
        <app-logo class="cursor-pointer" @click="handleLogoClick" />
      </div>
      <p class="my-6 text-gray-500 dark:text-gray-400">
        Your personal financial tracker!
      </p>
      <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
        © 2021-2022
        <span>Artosna™</span>.
        All Rights Reserved.
      </span>
    </div>
  </footer>
</template>

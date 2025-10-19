<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()
</script>

<template>
  <div class="flex items-center justify-center">
    <v-btn color="primary" @click="router.push('/app')">Go to App</v-btn>
  </div>
</template>

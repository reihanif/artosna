<script setup>
  const props = defineProps({
    title: {
      type: String,
      default: () => '',
    },
    value: {
      type: [String, Number],
      default: () => '',
    },
    infoLabel: {
      type: String,
      default: () => 'Available Balance',
    },
    icon: {
      type: String,
      default: () => 'mdi-wallet-outline',
    },
  })
</script>

<template>
  <v-card class="bg-primary-50 dark:bg-primary-900" rounded="lg">
    <v-card-text class="flex flex-col justify-between sm:h-[12rem]">
      <div class="flex items-center gap-4 mb-12">
        <v-icon class="text-primary-700 dark:text-white" :icon="props.icon" size="32" />
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">{{ props.title }}</h3>
      </div>
      <div>
        <p class="mt-2 flex gap-1 items-center text-sm leading-6 text-gray-500 dark:text-gray-400">
          {{ props.infoLabel }}
        </p>
        <span class="flex items-center text-lg font-bold text-gray-900 dark:text-white">
          {{ props.value }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

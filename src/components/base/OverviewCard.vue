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
      default: () => 'vs last month',
    },
    infoIcon: {
      type: String,
      default: () => 'mdi-information-slab-circle-outline',
    },
    icon: {
      type: String,
      default: () => '',
    },
    iconSize: {
      type: [String, Number],
      default: () => '32',
    },
    badgeText: {
      type: String,
      default: () => null,
    },
    badgeColor: {
      type: String,
      default: () => null,
      validator: value => ['red', 'green', 'gray'].includes(value),
    },
    badgeIcon: {
      type: String,
      default: () => null,
    },
  })
</script>

<template>
  <v-card rounded="lg">
    <v-card-text>
      <v-icon v-if="props.icon" color="primary" :icon="props.icon" :size="props.iconSize" />
      <h3 class="mt-2 text-sm sm:text-lg text-gray-700 dark:text-gray-200">{{ props.title }}</h3>
      <span class="flex items-center text-base sm:text-xl font-bold text-gray-900 dark:text-white">
        {{ props.value }}
        <span
          v-if="badgeText && badgeText !== 'infinity'"
          class="ms-2 inline-flex gap-1 items-center rounded ps-0.5 pe-1.5 py-0.5 text-xs font-medium"
          :class="{
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': badgeColor === 'green',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': badgeColor === 'red',
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300': badgeColor === 'gray',
          }"
        >
          <v-icon :icon="badgeIcon" />
          {{ props.badgeText }}
        </span>
      </span>
      <p class="mt-2 flex gap-1 items-center text-xs sm:text-sm leading-6 text-gray-500 dark:text-gray-400">
        <v-icon :icon="props.infoIcon" />
        {{ props.infoLabel }}
      </p>
    </v-card-text>
  </v-card>
</template>

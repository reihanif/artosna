<script setup>
  const props = defineProps({
    modelValue: Boolean,
    prependIcon: String,
  })
  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <v-dialog max-width="600" :model-value="props.modelValue" persistent @update:model-value="emit('update:modelValue')">
    <v-card :prepend-icon="props.prependIcon" rounded="lg">
      <template #title>
        <slot name="title" />
      </template>
      <v-card-text class="px-6 py-4">
        <slot />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
  })

  const emit = defineEmits(['update:modelValue', 'update:submit'])

  const tab = ref('Expense')

  const items = [
    'Expense',
    'Income',
    'Transfer',
  ]
</script>

<template>
  <v-bottom-sheet :model-value="props.modelValue" @update:model-value="emit('update:modelValue', value)">
    <v-card class="space-y-2 min-h-dvh">
      <v-card rounded="none">
        <v-tabs
          v-model="tab"
          color="primary"
          grow
          mobile
        >
          <v-tab
            v-for="item in items"
            :key="item"
            :text="item"
            :value="item"
          />
        </v-tabs>
      </v-card>

      <v-card rounded="none">
        <v-tabs-window v-model="tab" class="p-2 py-3">
          <v-tabs-window-item value="Expense">
            <tab-expense @update:submit="emit('update:submit')" />
          </v-tabs-window-item>
          <v-tabs-window-item value="Income">
            <tab-income @update:submit="emit('update:submit')" />
          </v-tabs-window-item>
          <v-tabs-window-item value="Transfer">
            <tab-transfer @update:submit="emit('update:submit')" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </v-card>
  </v-bottom-sheet>
</template>

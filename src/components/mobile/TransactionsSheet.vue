<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
  })

  const emit = defineEmits(['update:modelValue'])

  const tab = ref('Expense')

  const items = [
    'Expense',
    'Income',
    'Transfer',
  ]
</script>

<template>
  <v-bottom-sheet :model-value="props.modelValue" @update:model-value="emit('update:modelValue', value)">
    <div class="py-4 space-y-2">
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
            <tab-expense />
          </v-tabs-window-item>
          <v-tabs-window-item value="Income">
            <tab-income />
          </v-tabs-window-item>
          <v-tabs-window-item value="Transfer">
            <tab-transfer />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card>
    </div>
  </v-bottom-sheet>
</template>

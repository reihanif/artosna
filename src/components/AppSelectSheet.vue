<script setup>
  import { ref, useAttrs } from 'vue'

  const props = defineProps({
    modelValue: [String, Number, Object],
    items: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const attrs = useAttrs()

  const sheet = ref(false)

  const selectedItem = ref(null)

  function openSheet () {
    sheet.value = true
  }

  function closeSheet () {
    sheet.value = false
  }

  function selectItem (item) {
    selectedItem.value = item
    emit('update:modelValue', item.value)
    closeSheet()
  }
</script>

<template>
  <div>
    <v-select
      v-bind="$attrs"
      :items="props.items"
      :label="label"
      :model-value="modelValue"
      readonly
      @click="openSheet"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </v-select>

    <v-bottom-sheet v-model="sheet">
      <v-sheet class="pa-2">
        <v-list>
          <template v-if="items.length > 0">
            <v-list-item
              v-for="(item, i) in items"
              :key="i"
              @click="selectItem(item)"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>
          <v-list-item v-else>
            {{ attrs['no-data-text'] ?? 'No data' }}
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-bottom-sheet>
  </div>
</template>

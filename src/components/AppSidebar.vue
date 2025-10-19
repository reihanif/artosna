<script setup>
  import { useRoute, useRouter } from 'vue-router'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const route = useRoute()
  const router = useRouter()
</script>

<template>
  <v-navigation-drawer floating :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-list nav>
      <template v-for="(category, index) in props.items" :key="index">
        <div v-if="index > 0" class="px-2 mt-4">
          <v-divider :opacity="1" :thickness="1" />
        </div>
        <v-list-subheader class="uppercase font-bold" color="primary">{{ category.category }}</v-list-subheader>

        <v-list-item
          v-for="(item, itemIndex) in category.children"
          :key="itemIndex"
          :active="route.path === item.route"
          color="primary"
          rounded="lg"
          :value="item"
          @click="router.push(item.route)"
        >
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>

          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

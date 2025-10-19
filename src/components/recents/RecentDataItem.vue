<script setup>
  const props = defineProps({
    item: {
      type: Object,
    },
  })

  const emit = defineEmits(['edit', 'delete'])

  function handleEdit () {
    emit('edit', props.item)
  }

  function handleDelete () {
    emit('delete', props.item)
  }

  function setTypeBadgeColor (value) {
    let color
    switch (value) {
      case 'expense': {
        color = 'red'
        break
      }
      case 'income': {
        color = 'green'
        break
      }
      case 'transfer': {
        color = 'primary'
        break
      }
    }
    return color
  }

  function setTypeBadgeIcon (value) {
    let icon
    switch (value) {
      case 'expense': {
        icon = 'mdi-export'
        break
      }
      case 'income': {
        icon = 'mdi-import'
        break
      }
      case 'transfer': {
        icon = 'mdi-swap-horizontal'
        break
      }
    }
    return icon
  }
</script>

<template>
  <div class="relative grid grid-cols-2 gap-2 py-4 sm:grid-cols-4 lg:grid-cols-5">
    <div class="col-span-2 content-center sm:col-span-4 lg:col-span-1">
      <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-700">
        <v-icon icon="mdi-calendar-blank-outline" />
        <p class="font-medium">{{ props.item.date }}</p>
      </div>
    </div>

    <div class="mt-0 content-center">
      <v-icon v-if="props.item.type === 'expense'" color="red" icon="mdi-minus" size="16" />
      <v-icon v-if="props.item.type === 'income'" color="green" icon="mdi-plus" size="16" />
      <span
        class="text-sm font-semibold"
        :class="{
          'text-primary-600 dark:text-primary-500': props.item.type === 'transfer',
          'text-red-600 dark:text-red-500': props.item.type === 'expense',
          'text-green-600 dark:text-green-500': props.item.type === 'income',
        }"
      >
        {{ props.item.amount }}
      </span>
    </div>

    <div class="mt-0 content-center text-end">
      <v-chip
        class="capitalize"
        :color="setTypeBadgeColor(props.item.type)"
        density="compact"
        size="small"
      >
        <v-icon :icon="setTypeBadgeIcon(props.item.type)" />
        <span class="ps-1">
          {{ props.item.type }}
        </span>
      </v-chip>
    </div>

    <div class="content-start">
      <div class="flex items-center gap-2">
        <p class="text-sm">{{ props.item.title }}</p>
      </div>
    </div>

    <div class="absolute right-0 top-2 content-center sm:relative sm:right-auto sm:top-auto">
      <v-btn
        color="primary"
        density="compact"
        icon
        variant="text"
      >
        <v-icon icon="mdi-dots-horizontal" />
        <v-menu activator="parent" :width="120">
          <v-card class="shadow-2xl">
            <v-list density="compact" :lines="false" nav>
              <v-list-item @click="handleEdit">
                <div class="flex items-center gap-2 text-primary-700">
                  <v-icon icon="mdi-pencil-outline" />
                  <v-list-item-title>Edit</v-list-item-title>
                </div>
              </v-list-item>
              <v-list-item @click="handleDelete">
                <div class="flex items-center gap-2 text-red-500">
                  <v-icon icon="mdi-trash-can-outline" />
                  <v-list-item-title>Delete</v-list-item-title>
                </div>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-btn>
    </div>
  </div>
</template>

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
</script>

<template>
  <div class="relative grid grid-cols-2 gap-2 pt-4 pb-4 sm:grid-cols-4 lg:grid-cols-5">
    <div class="col-span-2 content-center sm:col-span-4 lg:col-span-1">
      <div class="space-y-0.5 mb-2">
        <p class="text-base font-medium">{{ props.item.name }}</p>
        <div>
          <v-chip
            class="capitalize"
            color="primary"
            density="compact"
            size="small"
          >
            <span>
              {{ props.item.category }}
            </span>
          </v-chip>
        </div>
      </div>
    </div>

    <div class="col-span-2 mt-0 mx-4 content-center space-y-2">
      <div class="flex justify-between p-2.5 rounded-lg bg-gray-50">
        <div class="flex-grow border-e">
          <div class="text-xs">
            Allocation :
          </div>
          <div class="text-sm font-semibold text-primary-600 dark:text-primary-300">
            {{ props.item.allocation }}
          </div>
        </div>
        <div class="flex-grow text-end">
          <div class="text-xs">
            Realization :
          </div>
          <div class="text-sm font-semibold text-primary-600 dark:text-primary-300">
            {{ props.item.realization }}
          </div>
        </div>
      </div>
      <div>
        <div class="text-xs">
          Remain :
        </div>
        <div
          class="text-sm font-semibold"
          :class="{
            'text-primary-600 dark:text-primary-300': !props.item.isOverbudget,
            'text-red-600 dark:text-red-300': props.item.isOverbudget,
          }"
        >
          {{ props.item.remain }}
        </div>
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

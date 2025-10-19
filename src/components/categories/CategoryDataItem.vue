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
  <div class="relative grid grid-cols-2 gap-2 pt-3 pb-2 sm:grid-cols-4 lg:grid-cols-5">
    <div class="col-span-2 content-center sm:col-span-4 lg:col-span-1">
      <div class="space-y-1 mb-1">
        <p class="text-sm font-medium">{{ props.item.name }}</p>
        <div>
          <v-chip
            class="capitalize"
            :color="props.item.type === 'expense' ? 'red' : 'green'"
            density="compact"
            size="small"
          >
            <v-icon icon="mdi-label" start />
            {{ props.item.type }}
          </v-chip>
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

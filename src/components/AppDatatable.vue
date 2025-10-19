<script setup>
  const props = defineProps({
    headers: Array,
    items: Array,
    itemsPerPage: Number,
    loading: Boolean,
    page: Number,
    totalPage: Number,
  })
  const emit = defineEmits(['edit', 'delete', 'update:page'])

  function handleEdit (item) {
    emit('edit', item)
  }
  async function handleDelete (item) {
    emit('delete', item)
  }
  async function handlePageChange (page) {
    emit('update:page', page)
  }
</script>

<template>
  <div class="space-y-4">
    <div>
      <v-data-table
        v-bind="$attrs"
        :headers="props.headers"
        :items="props.items"
        :items-per-page="props.itemsPerPage"
        :loading="props.loading"
      >
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps" />
        </template>
        <template #loading>
          <div class="p-8">
            <v-img
              alt="loading"
              aspect-ratio="1/1"
              class="mx-auto"
              :height="300"
              src="@/assets/illustrations/loading.svg"
            />
          </div>
        </template>
        <template #no-data>
          <div class="p-8">
            <v-img
              alt="no-data"
              aspect-ratio="1/1"
              class="mx-auto"
              :height="300"
              src="@/assets/illustrations/no-data.svg"
            />
            <div class="text-sm text-[#606060] mb-6">
              There is no data found
            </div>
          </div>
        </template>
        <template #item.action="{ item }">
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
                  <v-list-item @click="handleEdit(item)">
                    <div class="flex items-center gap-2 text-primary-700">
                      <v-icon icon="mdi-pencil-outline" />
                      <v-list-item-title>Edit</v-list-item-title>
                    </div>
                  </v-list-item>
                  <v-list-item @click="handleDelete(item)">
                    <div class="flex items-center gap-2 text-red-500">
                      <v-icon icon="mdi-trash-can-outline" />
                      <v-list-item-title>Delete</v-list-item-title>
                    </div>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </v-btn>
        </template>
      </v-data-table>
    </div>

    <div class="flex justify-center sm:justify-end">
      <v-pagination
        color="primary"
        density="compact"
        :disabled="props.loading"
        :length="props.totalPage"
        :model-value="props.page"
        :total-visible="3"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

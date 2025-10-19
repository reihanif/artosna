<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useCategories } from '@/composables/useCategories'
  import { useOptions } from '@/composables/useOptions'

  const options = useOptions()

  // Single source of truth - only call useCategories once in parent
  const { tables, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories()

  const dialog = reactive({
    show: false,
    type: 'create',
  })

  const formOptions = reactive({
    type: [],
  })

  const formLoad = reactive({
    submit: false,
  })

  const selectedItem = ref(null)

  function handleCreate () {
    selectedItem.value = null
    dialog.type = 'create'
    dialog.show = true
  }

  function handleEdit (item) {
    selectedItem.value = item
    dialog.type = 'update'
    dialog.show = true
  }

  async function handleSubmit (formData) {
    formLoad.submit = true

    let result
    if (dialog.type === 'create') {
      result = await createCategory(formData)
    } else if (dialog.type === 'update') {
      result = await updateCategory(formData.id, formData)
    }

    formLoad.submit = false

    if (!result.error) {
      dialog.show = false
      await fetchCategories(tables.page)
    }
  }

  async function handleDelete (item) {
    const result = await deleteCategory(item)
    if (result.success) {
      await fetchCategories(tables.page)
    }
  }

  async function handlePageChange (page) {
    await fetchCategories(page)
  }

  function handleClose () {
    selectedItem.value = null
  }

  onMounted(async () => {
    formOptions.type = options.getTransactionOptions()
    await fetchCategories()
  })
</script>

<template>
  <v-card variant="flat">
    <v-card-text class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Categories</h1>

        <v-btn color="primary" variant="flat" @click="handleCreate">
          <template #prepend>
            <v-icon icon="mdi-plus" />
          </template>
          Create
        </v-btn>
      </div>

      <!-- Pass all table state as props -->
      <app-datatable
        :headers="tables.headers"
        :items="tables.items"
        :items-per-page="tables.itemsPerPage"
        :loading="tables.loading"
        :page="tables.page"
        :total-page="tables.totalPage"
        @delete="handleDelete"
        @edit="handleEdit"
        @update:page="handlePageChange"
      >
        <template #item.name="{ value }">
          <span class="font-semibold">
            {{ value }}
          </span>
        </template>
        <template #item.type="{ value }">
          <v-chip
            class="capitalize"
            :color="value === 'expense' ? 'red' : 'green'"
            density="compact"
          >
            <v-icon icon="mdi-label" start />
            {{ value }}
          </v-chip>
        </template>
      </app-datatable>
    </v-card-text>

    <category-form-modal
      v-model="dialog.show"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      :type-options="formOptions.type"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </v-card>
</template>

<script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useCategories } from '@/composables/useCategories'
  import { useOptions } from '@/composables/useOptions'

  const options = useOptions()

  // Single source of truth - only call useCategories once in parent
  const { tables, fetchAllCategories, createCategory, updateCategory, deleteCategory } = useCategories()

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
      await fetchAllCategories()
    }
  }

  async function handleDelete (item) {
    const result = await deleteCategory(item)
    if (result.success) {
      await fetchAllCategories()
    }
  }

  function handleClose () {
    selectedItem.value = null
  }

  onMounted(async () => {
    formOptions.type = options.getTransactionOptions()
    await fetchAllCategories()
  })
</script>

<template>
  <div class="space-y-1 mb-6">
    <v-card class="px-4 pb-4">
      <v-btn
        v-if="tables.totalItems > 0"
        block
        color="primary"
        prepend-icon="mdi-plus"
        size="default"
        type="submit"
        variant="outlined"
        @click="handleCreate"
      >
        Add Category
      </v-btn>
    </v-card>

    <div>
      <template v-if="tables.loading">
        <div class="flex justify-center">
          <v-progress-circular color="primary" indeterminate />
        </div>
      </template>
      <template v-else-if="tables.totalItems === 0">
        <div class="text-center">
          <div class="flex justify-center">
            <v-img
              alt="no-data"
              aspect-ratio="1/1"
              class="mx-auto"
              :height="200"
              src="@/assets/illustrations/no-data.svg"
            />
          </div>
          <p class="text-lg font-medium">No Categories</p>
          <p class="px-8 mb-6 text-sm text-gray-600 dark:text-gray-300">You have not created any categories</p>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            size="default"
            type="submit"
            variant="flat"
            @click="handleCreate"
          >
            Add Category
          </v-btn>
        </div>
      </template>
      <template v-else>
        <v-card v-for="(item, index) in tables.items" :key="index" class="rounded-none mb-1 px-2">
          <category-data-item
            :item="item"
            @delete="handleDelete(item)"
            @edit="handleEdit(item)"
          />
        </v-card>
      </template>
    </div>

    <category-form-sheet
      v-model="dialog.show"
      :initial-data="selectedItem"
      :loading="formLoad.submit"
      :type="dialog.type"
      :type-options="formOptions.type"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </div>
</template>

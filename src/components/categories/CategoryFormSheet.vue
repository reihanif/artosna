<script setup>
  import { computed, reactive, watch } from 'vue'
  import { useRules } from 'vuetify/labs/rules'

  const props = defineProps({
    modelValue: Boolean,
    type: String,
    loading: Boolean,
    typeOptions: Array,
    initialData: Object,
    categoryType: String,
  })

  const emit = defineEmits(['update:modelValue', 'submit', 'close'])

  const rules = useRules()

  const formData = reactive({
    id: null,
    name: null,
    type: null,
  })

  const dialogModel = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  watch(() => props.initialData, data => {
    if (data) {
      formData.id = data.id
      formData.name = data.name
      formData.type = data.type
    }
  }, { deep: true })

  watch(() => props.categoryType, type => {
    if (type) {
      formData.type = type
    }
  }, { immediate: true })

  function handleSubmit () {
    emit('submit', { ...formData })
  }

  function handleClose () {
    resetFormData()
    emit('close')
  }

  function resetFormData () {
    formData.id = null
    formData.name = null
    formData.type = null
  }
</script>

<template>
  <app-form-sheet
    v-model="dialogModel"
    :loading="loading"
    prepend-icon="mdi-format-list-group"
    :submit-text="type === 'update' ? 'Save' : type"
    @close="handleClose"
    @submit="handleSubmit"
  >
    <template #title>
      <span class="capitalize text-base">
        {{ type === 'update' ? 'Edit' : type }} Category
      </span>
    </template>
    <template #form>
      <v-text-field
        v-model="formData.name"
        autocomplete="off"
        density="comfortable"
        hide-details="auto"
        label="Name"
        :rules="[rules.required('Category name is required')]"
        variant="outlined"
      />
      <app-select-sheet
        v-if="!props.categoryType"
        v-model="formData.type"
        density="comfortable"
        hide-details="auto"
        :items="typeOptions"
        label="Type"
        :rules="[rules.required('Category type is required')]"
        variant="outlined"
      />
    </template>
  </app-form-sheet>
</template>

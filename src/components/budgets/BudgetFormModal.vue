<script setup>
  import moment from 'moment'
  import { computed, reactive, ref, watch } from 'vue'
  import { useRules } from 'vuetify/labs/rules'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update'].includes(value),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    categoryOptions: {
      type: Array,
      default: () => [],
    },
    walletOptions: {
      type: Array,
      default: () => [],
    },
    initialData: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'submit', 'close'])

  const rules = useRules()

  const monthPicker = ref(false)
  const formData = reactive({
    id: null,
    date: null,
    name: null,
    category: null,
    wallet: null,
    allocation: null,
    notes: null,
  })

  const period = computed(() => {
    if (!formData.date) return null
    return moment(formData.date).format('MMMM YYYY')
  })

  const dialogModel = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  function handleSubmit () {
    emit('submit', { ...formData })
  }

  function handleClose () {
    resetForm()
    emit('close')
    emit('update:modelValue', false)
  }

  function resetForm () {
    formData.id = null
    formData.name = null
    formData.date = null
    formData.category = null
    formData.wallet = null
    formData.allocation = null
    formData.notes = null
  }

  function setFormData (data) {
    if (!data) {
      resetForm()
      return
    }

    formData.id = data.id
    formData.name = data.name
    formData.date = data.periodDate || data.date
    formData.category = data.categories?.id || data.category
    formData.wallet = data.pockets?.id || data.wallet
    formData.allocation = data.allocation
    formData.notes = data.notes
  }

  watch(() => props.initialData, newData => {
    setFormData(newData)
  }, { immediate: true, deep: true })

  watch(() => props.modelValue, isOpen => {
    if (!isOpen) {
      resetForm()
    }
  })

  useCurrencyFormatter(formData, 'allocation')

  defineExpose({
    resetForm,
    setFormData,
    formData,
  })
</script>

<template>
  <app-form-modal
    v-model="dialogModel"
    :loading="loading"
    prepend-icon="mdi-cash-multiple"
    :submit-text="type === 'update' ? 'Save' : type"
    @close="handleClose"
    @submit="handleSubmit"
  >
    <template #title>
      <span class="capitalize">
        {{ type === 'update' ? 'Edit' : type }} Budget
      </span>
    </template>
    <template #form>
      <v-text-field
        v-model="period"
        autocomplete="off"
        hide-details="auto"
        label="Period"
        readonly
        :rules="[rules.required('Budget period is required')]"
        variant="outlined"
        @click="monthPicker = true"
      />
      <app-month-picker v-model="monthPicker" v-model:selected-date="formData.date" />
      <v-text-field
        v-model="formData.name"
        autocomplete="off"
        hide-details="auto"
        label="Name"
        :rules="[rules.required('Budget name is required')]"
        variant="outlined"
      />
      <v-select
        v-model="formData.category"
        hide-details="auto"
        :items="categoryOptions"
        label="Category"
        :rules="[rules.required('Budget category is required')]"
        variant="outlined"
      />
      <v-select
        v-model="formData.wallet"
        hide-details="auto"
        :items="walletOptions"
        label="Wallet"
        :rules="[rules.required('Budget wallet is required')]"
        variant="outlined"
      />
      <v-text-field
        v-model="formData.allocation"
        autocomplete="off"
        hide-details="auto"
        inputmode="numeric"
        label="Allocation"
        :rules="[rules.required('Budget allocation is required')]"
        variant="outlined"
      >
        <template v-if="formData.allocation" #prepend-inner>
          Rp
        </template>
      </v-text-field>
      <v-textarea
        v-model="formData.notes"
        auto-grow
        autocomplete="off"
        hide-details="auto"
        label="Notes"
        rows="2"
        variant="outlined"
      />
    </template>
  </app-form-modal>
</template>

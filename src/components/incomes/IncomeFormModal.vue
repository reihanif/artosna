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

  const datePicker = ref(false)
  const formData = reactive({
    id: null,
    title: null,
    category: null,
    amount: null,
    date: null,
    pocket: null,
    notes: null,
  })

  const formattedDate = computed(() => {
    if (!formData.date) return null
    return moment(formData.date).format('DD MMMM YYYY')
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
    formData.title = null
    formData.category = null
    formData.amount = null
    formData.date = null
    formData.pocket = null
    formData.notes = null
  }

  function setFormData (data) {
    if (!data) {
      resetForm()
      return
    }

    formData.id = data.id
    formData.title = data.title
    formData.category = data.categoryId || data.category
    formData.amount = data.amountValue || data.amount
    formData.date = data.dateValue || data.date
    formData.pocket = data.pocketId || data.pocket
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

  useCurrencyFormatter(formData, 'amount')

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
    :submit-text="type"
    @close="handleClose"
    @submit="handleSubmit"
  >
    <template #title>
      <span class="capitalize">
        {{ type }} Income
      </span>
    </template>
    <template #form>
      <v-text-field
        v-model="formattedDate"
        autocomplete="off"
        hide-details="auto"
        label="Date"
        readonly
        :rules="[rules.required('Income date is required')]"
        variant="outlined"
        @click="datePicker = true"
      />
      <app-date-picker v-model="datePicker" v-model:selected-date="formData.date" />

      <v-text-field
        v-model="formData.title"
        autocomplete="off"
        hide-details="auto"
        label="Title"
        :rules="[rules.required('Income title is required')]"
        variant="outlined"
      />

      <v-select
        v-model="formData.category"
        hide-details="auto"
        :items="categoryOptions"
        label="Category"
        :rules="[rules.required('Income category is required')]"
        variant="outlined"
      />

      <v-select
        v-model="formData.pocket"
        hide-details="auto"
        :items="walletOptions"
        label="Wallet"
        :rules="[rules.required('Income wallet is required')]"
        variant="outlined"
      />

      <v-text-field
        v-model="formData.amount"
        autocomplete="off"
        hide-details="auto"
        inputmode="numeric"
        label="Amount"
        :rules="[rules.required('Income amount is required')]"
        variant="outlined"
      >
        <template v-if="formData.amount" #prepend-inner>
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

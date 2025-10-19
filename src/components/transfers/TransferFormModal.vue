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
    walletOptions: {
      type: Array,
      default: () => [],
    },
    isLoadingWallets: {
      type: Boolean,
      default: false,
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
    amount: null,
    date: null,
    pocket: null,
    pocketDestination: null,
    notes: null,
  })

  const formattedDate = computed(() => {
    if (!formData.date) return null
    return moment(formData.date).format('DD MMMM YYYY')
  })

  // Filter source wallet list - exclude selected destination
  const sourceWalletList = computed(() =>
    props.walletOptions.filter(item => item.value !== formData.pocketDestination),
  )

  // Filter destination wallet list - exclude selected source
  const destinationWalletList = computed(() =>
    props.walletOptions.filter(item => item.value !== formData.pocket),
  )

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
    formData.amount = null
    formData.date = null
    formData.pocket = null
    formData.pocketDestination = null
    formData.notes = null
  }

  function setFormData (data) {
    if (!data) {
      resetForm()
      return
    }

    formData.id = data.id
    formData.title = data.title
    formData.amount = data.amountValue || data.amount
    formData.date = data.dateValue || data.date
    formData.pocket = data.pocketId || data.pocket
    formData.pocketDestination = data.destinationPocketId || data.pocketDestination
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
    prepend-icon="mdi-bank-transfer"
    :submit-text="type"
    @close="handleClose"
    @submit="handleSubmit"
  >
    <template #title>
      <span class="capitalize">
        {{ type }} Transfer
      </span>
    </template>
    <template #form>
      <v-text-field
        v-model="formattedDate"
        autocomplete="off"
        hide-details="auto"
        label="Date"
        readonly
        :rules="[rules.required('Transfer date is required')]"
        variant="outlined"
        @click="datePicker = true"
      />
      <app-date-picker v-model="datePicker" v-model:selected-date="formData.date" />

      <v-text-field
        v-model="formData.title"
        autocomplete="off"
        hide-details="auto"
        label="Title"
        :rules="[rules.required('Transfer title is required')]"
        variant="outlined"
      />

      <v-select
        v-model="formData.pocket"
        :disabled="isLoadingWallets"
        hide-details="auto"
        :items="sourceWalletList"
        label="Source Wallet"
        :loading="isLoadingWallets"
        :rules="[rules.required('Transfer wallet source is required')]"
        variant="outlined"
      />

      <v-select
        v-model="formData.pocketDestination"
        :disabled="isLoadingWallets"
        hide-details="auto"
        :items="destinationWalletList"
        label="Destination Wallet"
        :loading="isLoadingWallets"
        :rules="[rules.required('Transfer wallet destination is required')]"
        variant="outlined"
      />

      <v-text-field
        v-model="formData.amount"
        autocomplete="off"
        hide-details="auto"
        inputmode="numeric"
        label="Amount"
        :rules="[rules.required('Transfer amount is required')]"
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

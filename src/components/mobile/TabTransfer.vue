<script setup>
  import moment from 'moment'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRules } from 'vuetify/labs/rules'
  import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
  import { useOptions } from '@/composables/useOptions'
  import { useTransfers } from '@/composables/useTransfers'

  const emit = defineEmits('update:submit')

  const options = useOptions()
  const rules = useRules()
  const { createTransfer } = useTransfers()

  const formRef = ref(null)

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

  const formOptions = reactive({
    pocket: [],
  })

  const formLoad = reactive({
    submit: false,
  })

  const date = computed(() => {
    if (!formData.date) return null
    return moment(formData.date).format('DD MMMM YYYY')
  })

  // Filter source wallet list - exclude selected destination
  const sourceWalletList = computed(() =>
    formOptions.pocket.filter(item => item.value !== formData.pocketDestination),
  )

  // Filter destination wallet list - exclude selected source
  const destinationWalletList = computed(() =>
    formOptions.pocket.filter(item => item.value !== formData.pocket),
  )

  async function handleSubmit () {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    formLoad.submit = true

    const result = await createTransfer(formData)

    formLoad.submit = false

    if (!result.error) {
      emit('update:submit')
      resetForm()
    }
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

  useCurrencyFormatter(formData, 'amount')

  onMounted(async () => {
    formOptions.pocket = await options.fetchWalletOptions()
  })
</script>

<template>
  <div>
    <v-form ref="formRef" class="space-y-4 sm:space-y-6" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="date"
        autocomplete="off"
        density="comfortable"
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
        density="comfortable"
        hide-details="auto"
        label="Title"
        :rules="[rules.required('Transfer title is required')]"
        variant="outlined"
      />

      <app-select-sheet
        v-model="formData.pocket"
        density="comfortable"
        :disabled="options.isLoading.value"
        hide-details="auto"
        :items="sourceWalletList"
        label="Source Wallet"
        :loading="options.isLoading.value"
        :rules="[rules.required('Transfer wallet source is required')]"
        variant="outlined"
      />

      <app-select-sheet
        v-model="formData.pocketDestination"
        density="comfortable"
        :disabled="options.isLoading.value"
        hide-details="auto"
        :items="destinationWalletList"
        label="Destination Wallet"
        :loading="options.isLoading.value"
        :rules="[rules.required('Transfer wallet destination is required')]"
        variant="outlined"
      />

      <v-text-field
        v-model="formData.amount"
        autocomplete="off"
        density="comfortable"
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
        density="comfortable"
        hide-details="auto"
        label="Notes"
        rows="2"
        variant="outlined"
      />
      <div class="pt-4">
        <v-btn
          block
          class="capitalize"
          color="primary"
          :loading="formLoad.submit"
          size="large"
          text="Submit"
          type="submit"
          variant="flat"
        />
      </div>
    </v-form>
  </div>
</template>

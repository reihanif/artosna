<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    selectedDate: {
      type: Date,
      default: null,
    },
    title: {
      type: String,
      default: 'Select Month',
    },
    prependIcon: {
      type: String,
      default: 'mdi-calendar-outline',
    },
    minDate: {
      type: Date,
      default: null,
    },
    maxDate: {
      type: Date,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue', 'update:selectedDate', 'confirm', 'cancel'])

  // Temporary date holder (only updates parent on "Set")
  const tempSelectedDate = ref(null)

  // Initialize temp date from prop
  watch(
    () => props.selectedDate,
    newDate => {
      tempSelectedDate.value = newDate
    },
    { immediate: true },
  )

  // Reset temp date when dialog opens
  watch(
    () => props.modelValue,
    isOpen => {
      if (isOpen) {
        tempSelectedDate.value = props.selectedDate || new Date()
      }
    },
  )

  /**
   * Handle dialog close (ESC key or backdrop click)
   */
  function handleDialogClose () {
    // Do nothing on persistent dialog
  }

  /**
   * Handle close button click
   */
  function handleClose () {
    emit('update:modelValue', false)
    emit('cancel')
  };

  /**
   * Handle set button click
   */
  function handleSet () {
    emit('update:selectedDate', tempSelectedDate.value)
    emit('update:modelValue', false)
    emit('confirm', tempSelectedDate.value)
  };
</script>

<template>
  <v-dialog
    max-width="320"
    :model-value="modelValue"
    persistent
    @update:model-value="handleDialogClose"
  >
    <v-card rounded="lg">
      <v-card-text class="px-4 py-4">
        <month-picker
          v-model="tempSelectedDate"
          :max-date="maxDate"
          :min-date="minDate"
        />
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-row cols="2">
          <v-col>
            <v-btn
              block
              color="grey-darken-1"
              variant="text"
              @click="handleClose"
            >
              Close
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              block
              color="primary"
              :disabled="!tempSelectedDate"
              variant="tonal"
              @click="handleSet"
            >
              Set
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

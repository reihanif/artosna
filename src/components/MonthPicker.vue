<script setup>
  import { useMonthPicker } from '@/composables/useMonthPicker'

  const props = defineProps({
    modelValue: {
      type: Date,
      default: null,
    },
    customClass: {
      type: String,
      default: '',
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

  const emit = defineEmits(['update:modelValue', 'change'])

  const {
    months,
    currentYear,
    previousYear,
    nextYear,
    selectMonth,
    isSelected,
    isCurrentMonth,
    isDisabled,
  } = useMonthPicker(props, emit)

  function getMonthVariant (monthIndex) {
    if (isSelected(monthIndex)) return 'flat'
    if (isCurrentMonth(monthIndex)) return 'tonal'
    return 'text'
  }

  function getMonthColor (monthIndex) {
    if (isSelected(monthIndex)) return 'primary'
    if (isCurrentMonth(monthIndex)) return 'primary'
    return ''
  }
</script>

<template>
  <div>
    <v-card
      max-width="320"
    >
      <v-card-text>
        <!-- Year Navigation -->
        <div class="flex items-center justify-between mb-4">
          <v-btn
            aria-label="Previous year"
            icon
            size="small"
            variant="text"
            @click="previousYear"
          >
            <v-icon icon="mdi-chevron-left" />
          </v-btn>

          <span class="font-semibold text-lg">{{ currentYear }}</span>

          <v-btn
            aria-label="Next year"
            icon
            size="small"
            variant="text"
            @click="nextYear"
          >
            <v-icon icon="mdi-chevron-right" />
          </v-btn>
        </div>

        <!-- Months Grid -->
        <div class="grid grid-cols-3 gap-2">
          <v-btn
            v-for="(month, index) in months"
            :key="index"
            :aria-label="`Select ${month}`"
            :color="getMonthColor(index)"
            :variant="getMonthVariant(index)"
            @click="selectMonth(index)"
          >
            {{ month }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

import { ref, watch } from 'vue'

/**
 * Composable for month picker logic
 * @param {Object} props - Component props
 * @param {Function} emit - Emit function
 * @returns {Object} Month picker state and methods
 */
export function useMonthPicker (props, emit) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  const currentYear = ref(new Date().getFullYear())
  const today = new Date()

  // Initialize current year from modelValue if provided
  if (props.modelValue instanceof Date) {
    currentYear.value = props.modelValue.getFullYear()
  }

  /**
   * Navigate to previous year
   */
  const previousYear = () => {
    currentYear.value -= 1
  }

  /**
   * Navigate to next year
   */
  const nextYear = () => {
    currentYear.value += 1
  }

  /**
   * Select a month
   * @param {number} monthIndex - Index of the selected month (0-11)
   */
  const selectMonth = monthIndex => {
    if (isDisabled(monthIndex)) {
      return
    }

    const selectedDate = new Date(currentYear.value, monthIndex, 1)
    emit('update:modelValue', selectedDate)
    emit('change', selectedDate)
  }

  /**
   * Check if a month is selected
   * @param {number} monthIndex - Index of the month to check
   * @returns {boolean} True if the month is selected
   */
  const isSelected = monthIndex => {
    if (!props.modelValue || !(props.modelValue instanceof Date)) {
      return false
    }
    return (
      props.modelValue.getMonth() === monthIndex
      && props.modelValue.getFullYear() === currentYear.value
    )
  }

  /**
   * Check if a month is the current month
   * @param {number} monthIndex - Index of the month to check
   * @returns {boolean} True if the month is current
   */
  const isCurrentMonth = monthIndex => {
    return (
      today.getMonth() === monthIndex
      && today.getFullYear() === currentYear.value
    )
  }

  /**
   * Check if a month is disabled based on min/max dates
   * @param {number} monthIndex - Index of the month to check
   * @returns {boolean} True if the month is disabled
   */
  const isDisabled = monthIndex => {
    const monthDate = new Date(currentYear.value, monthIndex, 1)

    if (props.minDate && monthDate < new Date(props.minDate.getFullYear(), props.minDate.getMonth(), 1)) {
      return true
    }

    if (props.maxDate && monthDate > new Date(props.maxDate.getFullYear(), props.maxDate.getMonth(), 1)) {
      return true
    }

    return false
  }

  // Watch for modelValue changes to update currentYear
  watch(
    () => props.modelValue,
    newValue => {
      if (newValue instanceof Date) {
        currentYear.value = newValue.getFullYear()
      }
    },
  )

  return {
    months,
    currentYear,
    previousYear,
    nextYear,
    selectMonth,
    isSelected,
    isCurrentMonth,
    isDisabled,
  }
}

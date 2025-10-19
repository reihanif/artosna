// composables/useCurrencyFormatter.js
import { nextTick, watch } from 'vue'

export function useCurrencyFormatter (formData = null, fields = [], options = {}) {
  const {
    locale = 'id-ID',
    minDecimals = 0,
    maxDecimals = 0,
  } = options

  const formatCurrency = value => {
    if (!value && typeof Number) {
      return '0'
    }
    if (!value) {
      return ''
    }
    const cleaned = value.toString().replace(/\D/g, '')
    if (!cleaned) {
      return ''
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    }).format(Number(cleaned))
  }

  const parseCurrency = value => {
    if (!value) {
      return 0
    }
    const cleaned = value.toString().replace(/\D/g, '')
    return Number(cleaned || 0)
  }

  const watchers = []
  if (formData && fields.length > 0) {
    const fieldArray = Array.isArray(fields) ? fields : [fields]

    fieldArray.forEach(field => {
      const stopWatcher = watch(
        () => formData[field],
        async val => {
          if (val) {
            const formatted = formatCurrency(val)
            await nextTick()
            formData[field] = formatted
          }
        },
        { immediate: true },
      )
      watchers.push(stopWatcher)
    })
  }

  const stopAll = () => watchers.forEach(stop => stop())

  return { stopAll, formatCurrency, parseCurrency }
}

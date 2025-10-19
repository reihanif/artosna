import { ref } from 'vue'

const state = ref({
  isOpen: false,
  loading: false,
  title: '',
  message: '',
  confirm: {
    label: 'Confirm',
    color: 'primary',
    variant: 'flat',
  },
  cancel: {
    label: 'Cancel',
    color: 'primary',
    variant: 'outlined',
  },
  resolve: null,
  reject: null,
})

export function useConfirmation () {
  const open = (options = {}) => {
    return new Promise((resolve, reject) => {
      state.value = {
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmLabel: options.confirm?.label || 'Confirm',
        confirmVariant: options.confirm?.variant || 'flat',
        confirmColor: options.confirm?.color || 'primary',
        cancelLabel: options.cancel?.label || 'Cancel',
        cancelVariant: options.cancel?.variant || 'outlined',
        cancelColor: options.cancel?.color || 'primary',
        resolve: value => {
          state.value.loading = value
          resolve(value)
        },
        reject: reason => {
          state.value.isOpen = false
          reject(reason)
        },
      }
    })
  }

  const close = () => {
    if (state.value.reject) {
      state.value.reject(new Error('Dialog closed'))
    }
    state.value.loading = false
    state.value.isOpen = false
  }

  return {
    state,
    open,
    close,
  }
}

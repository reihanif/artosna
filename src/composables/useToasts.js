import { ref } from 'vue'

const toasts = ref([])

let id = 0

export function useToasts () {
  function push (msg, options = {}) {
    const toast = {
      id: ++id,
      text: msg,
      color: options.color || 'info',
      timeout: options.timeout || 3000,
    }

    toasts.value.push(toast)

    // auto-remove after timeout
    if (toast.timeout > 0) {
      setTimeout(() => {
        remove(toast.id)
      }, toast.timeout)
    }
  }

  function remove (toastId) {
    toasts.value = toasts.value.filter(t => t.id !== toastId)
  }

  return {
    toasts,
    push,
    remove,
  }
}

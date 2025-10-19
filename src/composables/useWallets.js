import { reactive, ref } from 'vue'
import { useConfirmation } from '@/composables/useConfirmation'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
import { useToasts } from '@/composables/useToasts'
import { supabase } from '@/utils/supabase'

export function useWallets () {
  const toast = useToasts()
  const confirmation = useConfirmation()
  const { formatCurrency, parseCurrency } = useCurrencyFormatter()

  const loading = ref(false)

  const tables = reactive({
    loading: true,
    headers: [
      { title: 'Name', key: 'name', sortable: false },
      { title: 'Initial Balance', key: 'initialBalance', sortable: false, width: 300 },
      { title: 'Balance', key: 'currentBalance', sortable: false, width: 300 },
      { title: '', key: 'action', sortable: false, width: 50 },
    ],
    items: [],
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    totalPage: 1,
  })

  async function fetchWallets (page = 1) {
    tables.loading = true
    const firstItem = (page - 1) * tables.itemsPerPage
    const lastItem = firstItem + (tables.itemsPerPage - 1)

    const { data, error, count } = await supabase
      .from('pockets')
      .select('id, name, current_balance, initial_balance', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(firstItem, lastItem)

    if (error) {
      console.error(error)
      toast.push('Error fetching wallets', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.items = data.map(item => ({
        ...item,
        initialBalance: `Rp ${formatCurrency(item.initial_balance)}`,
        currentBalance: `Rp ${formatCurrency(item.current_balance)}`,
      }))
      tables.page = page
      tables.totalItems = count
      tables.totalPage = Math.ceil(count / tables.itemsPerPage)
    } else {
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    }

    tables.loading = false
    return { data: tables.items, error }
  }

  async function fetchAllWallets () {
    tables.loading = true

    const { data, error, count } = await supabase
      .from('pockets')
      .select('id, name, current_balance, initial_balance', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      toast.push('Error fetching wallets', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.items = data.map(item => ({
        ...item,
        initialBalance: `Rp ${formatCurrency(item.initial_balance)}`,
        currentBalance: `Rp ${formatCurrency(item.current_balance)}`,
      }))
      tables.page = 1
      tables.totalItems = count
      tables.totalPage = Math.ceil(count / tables.itemsPerPage)
    } else {
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    }

    tables.loading = false
    return { data: tables.items, error }
  }

  async function fetchWalletsOverview () {
    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('pockets')
        .select('id, name, current_balance')
        .order('current_balance', { ascending: false })

      if (fetchError) {
        console.error('Error fetching wallets:', fetchError)
        return []
      }
      return data.map(item => ({
        name: item.name,
        balance: item.current_balance,
      }))
    } finally {
      loading.value = false
    }
  }

  async function createWallet (walletData) {
    const payload = {
      name: walletData.name,
    }

    if (walletData.initialBalance) {
      payload.initial_balance = parseCurrency(walletData.initialBalance)
    }

    const { data, error } = await supabase
      .from('pockets')
      .insert([payload])
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${data[0].name} created`, { color: 'success' })
    return { data, error: null }
  }

  async function updateWallet (id, walletData) {
    const payload = {
      name: walletData.name,
      initial_balance: parseCurrency(walletData.initialBalance),
    }

    const { data, error } = await supabase
      .from('pockets')
      .update(payload)
      .eq('id', id)
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${data[0].name} updated`, { color: 'success' })
    return { data, error: null }
  }

  async function deleteWallet (item) {
    try {
      await confirmation.open({
        title: `Delete ${item.name}`,
        message: `Are you sure you want to delete ${item.name}? This action cannot be undone.`,
        confirm: {
          label: 'Delete',
          color: 'red',
          variant: 'outlined',
        },
        cancel: {
          label: 'Cancel',
          variant: 'flat',
        },
      })

      const { error } = await supabase
        .from('pockets')
        .delete()
        .eq('id', item.id)

      if (error) {
        toast.push('Error occurred!', { color: 'error', timeout: 5000 })
        return { success: false, error }
      }

      toast.push(`${item.name} has been removed`, { color: 'success' })
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    } finally {
      confirmation.close()
    }
  }

  return {
    tables,
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet,
    fetchWalletsOverview,
    fetchAllWallets,
  }
}

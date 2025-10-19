import moment from 'moment'
import { reactive, ref } from 'vue'
import { useConfirmation } from '@/composables/useConfirmation'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
import { useToasts } from '@/composables/useToasts'
import { supabase } from '@/utils/supabase'

export function useBudgets () {
  const toast = useToasts()
  const confirmation = useConfirmation()
  const { formatCurrency, parseCurrency } = useCurrencyFormatter()

  const loading = ref(false)
  const tables = reactive({
    loading: true,
    headers: [
      { title: 'Period', key: 'period', sortable: false },
      { title: 'Name', key: 'name', sortable: false },
      { title: 'Category', key: 'category', sortable: false },
      { title: 'Wallet', key: 'wallet', sortable: false },
      { title: 'Allocation', key: 'allocation', sortable: false },
      { title: '', key: 'action', sortable: false, width: 50 },
    ],
    items: [],
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    totalPage: 1,
  })

  async function fetchBudgets (page = 1) {
    tables.loading = true
    const firstItem = (page - 1) * tables.itemsPerPage
    const lastItem = firstItem + (tables.itemsPerPage - 1)

    const { data, error, count } = await supabase
      .from('budgets')
      .select(`
        id,
        period,
        categories (
          id,
          name
        ),
        name,
        pockets (
          id,
          name
        ),
        notes,
        allocation
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(firstItem, lastItem)

    if (error) {
      console.error(error)
      toast.push('Error fetching budgets', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.items = data.map(item => ({
        ...item,
        period: moment(item.period).format('MMMM YYYY'),
        periodDate: moment(item.period).toDate(),
        category: item.categories.name,
        wallet: item.pockets.name,
        allocation: `Rp ${formatCurrency(item.allocation)}`,
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

  async function fetchBudgetsWithTransactionsByMonth (page = 1, month = null) {
    tables.loading = true

    const startISO = moment(month).startOf('month').toISOString()
    const endISO = moment(month).endOf('month').toISOString()

    const firstItem = (page - 1) * tables.itemsPerPage
    const lastItem = firstItem + (tables.itemsPerPage - 1)

    const { data, error, count } = await supabase
      .from('budgets')
      .select(`
        id,
        period,
        categories (
          name
        ),
        transactions (
          amount
        ),
        name,
        allocation
      `, { count: 'exact' })
      .order('name', { referencedTable: 'categories', ascending: true })
      .gte('period', startISO)
      .lte('period', endISO)
      .range(firstItem, lastItem)

    if (error) {
      console.error(error)
      toast.push('Error fetching budgets', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.items = data.map(item => {
        const totalTransactions = item.transactions.reduce((sum, t) => sum + t.amount, 0)
        const remainValue = item.allocation - totalTransactions
        const formattedRemain = `${remainValue < 0 ? '- ' : ''}Rp ${formatCurrency(Math.abs(remainValue))}`

        return {
          id: item.id,
          period: moment(item.period).format('MMMM YYYY'),
          periodDate: moment(item.period).toDate(),
          name: item.name,
          category: item.categories.name,
          realization: `Rp ${formatCurrency(totalTransactions)}`,
          allocation: `Rp ${formatCurrency(item.allocation)}`,
          remain: formattedRemain,
          isOverbudget: remainValue < 0,
        }
      })
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

  async function fetchBudgetsWithTransactionsByMonthNoPagination (month = null) {
    tables.loading = true

    const startISO = moment(month).startOf('month').toISOString()
    const endISO = moment(month).endOf('month').toISOString()

    const { data, error, count } = await supabase
      .from('budgets')
      .select(`
        id,
        period,
        categories (
          id,
          name
        ),
        transactions (
          amount
        ),
        pockets (
          id,
          name
        ),
        name,
        allocation
      `, { count: 'exact' })
      .order('name', { referencedTable: 'categories', ascending: true })
      .gte('period', startISO)
      .lte('period', endISO)

    if (error) {
      console.error(error)
      toast.push('Error fetching budgets', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.items = data.map(item => {
        const totalTransactions = item.transactions.reduce((sum, t) => sum + t.amount, 0)
        const remainValue = item.allocation - totalTransactions
        const formattedRemain = `${remainValue < 0 ? '- ' : ''}Rp ${formatCurrency(Math.abs(remainValue))}`

        return {
          ...item,
          period: moment(item.period).format('MMMM YYYY'),
          periodDate: moment(item.period).toDate(),
          name: item.name,
          category: item.categories.name,
          realization: `Rp ${formatCurrency(totalTransactions)}`,
          allocation: `Rp ${formatCurrency(item.allocation)}`,
          remain: formattedRemain,
          isOverbudget: remainValue < 0,
        }
      })
      tables.page = 1
      tables.totalItems = count
      tables.totalPage = 1
    } else {
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    }

    tables.loading = false
    return { data: tables.items, error }
  }

  async function fetchTotalBudgetsByMonth (month) {
    try {
      loading.value = true
      const startISO = moment(month).startOf('month').toISOString()
      const endISO = moment(month).endOf('month').toISOString()

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select(`
          allocation
        `)
        .gte('period', startISO)
        .lte('period', endISO)

      if (fetchError) {
        console.error('Error fetching budgets:', fetchError)
        return []
      }

      return data?.reduce((sum, item) => sum + item.allocation, 0) ?? 0
    } catch (error) {
      error.value = error
      console.error('Unexpected error fetching budgets:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchRealizationBudgetsByMonth (month) {
    try {
      loading.value = true
      const startISO = moment(month).startOf('month').toISOString()
      const endISO = moment(month).endOf('month').toISOString()

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select(`
          transactions!inner (
            amount
          )
        `)
        .eq('transactions.type', 'expense')
        .gte('period', startISO)
        .lte('period', endISO)

      if (fetchError) {
        console.error('Error fetching budgets:', fetchError)
        return []
      }

      return data?.reduce((sum, item) => sum + item.transactions.reduce((sum, item) => sum + item.amount, 0), 0) ?? 0
    } catch (error) {
      error.value = error
      console.error('Unexpected error fetching budgets:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createBudget (budgetData) {
    const { data, error } = await supabase
      .from('budgets')
      .insert([
        {
          period: moment(budgetData.date).toISOString(),
          category_id: budgetData.category,
          name: budgetData.name,
          pocket_id: budgetData.wallet,
          allocation: parseCurrency(budgetData.allocation),
          notes: budgetData.notes,
        },
      ])
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${budgetData.name} created`, { color: 'success' })
    return { data, error: null }
  }

  async function updateBudget (id, budgetData) {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        period: moment(budgetData.date).toISOString(),
        category_id: budgetData.category,
        name: budgetData.name,
        pocket_id: budgetData.wallet,
        allocation: parseCurrency(budgetData.allocation),
        notes: budgetData.notes,
      })
      .eq('id', id)
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${budgetData.name} updated`, { color: 'success' })
    return { data, error: null }
  }

  async function deleteBudget (item) {
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
        .from('budgets')
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
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    fetchBudgetsWithTransactionsByMonth,
    fetchBudgetsWithTransactionsByMonthNoPagination,
    fetchTotalBudgetsByMonth,
    fetchRealizationBudgetsByMonth,
  }
}

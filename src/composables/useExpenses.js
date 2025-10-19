import moment from 'moment'
import { reactive, ref } from 'vue'
import { useConfirmation } from '@/composables/useConfirmation'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
import { useToasts } from '@/composables/useToasts'
import { supabase } from '@/utils/supabase'

export function useExpenses () {
  const toast = useToasts()
  const confirmation = useConfirmation()
  const { formatCurrency, parseCurrency } = useCurrencyFormatter()

  const loading = ref(false)
  const tables = reactive({
    loading: true,
    headers: [
      { title: 'Date', key: 'date', sortable: false, width: 200 },
      { title: 'Title', key: 'title', sortable: false },
      { title: 'Amount', key: 'amount', sortable: false, width: 240 },
      { title: 'Budget', key: 'budget', sortable: false },
      { title: 'Category', key: 'category', sortable: false },
      { title: 'Wallet', key: 'pocket', sortable: false, width: 240 },
      { title: '', key: 'action', sortable: false, width: 50 },
    ],
    items: [],
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    totalPage: 1,
  })

  async function fetchExpenses (page = 1) {
    tables.loading = true
    const firstItem = ((page - 1) * tables.itemsPerPage)
    const lastItem = (firstItem + (tables.itemsPerPage - 1))
    const { data, error, count } = await supabase
      .from('transactions')
      .select(`
        id,
        title,
        amount,
        date,
        pocket_id (
          id,
          name
        ),
        budgets (
          id,
          name,
          categories (
            id,
            name
          )
        ),
        notes,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('type', 'expense')
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
        id: item.id,
        title: item.title,
        amount: `Rp ${formatCurrency(item.amount)}`,
        amountValue: item.amount,
        date: moment(item.date).format('DD MMMM YYYY'),
        dateValue: moment(item.date).toDate(),
        pocketId: item.pocket_id.id,
        pocket: item.pocket_id.name,
        budgetId: item.budgets?.id,
        budget: item.budgets?.name,
        categoryId: item.budgets?.categories.id,
        category: item.budgets?.categories.name,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
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
  }

  async function fetchTotalExpensesByMonth (month) {
    try {
      loading.value = true
      const startISO = moment(month).startOf('month').toISOString()
      const endISO = moment(month).endOf('month').toISOString()

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense')
        .gte('date', startISO)
        .lte('date', endISO)

      if (fetchError) {
        console.error(`Error fetching ${'expenses'}:`, fetchError)
        return []
      }

      return data?.reduce((sum, item) => sum + item.amount, 0) ?? 0
    } catch (error) {
      error.value = error
      console.error('Unexpected error fetching expenses:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchExpensesByDate () {
    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('date, amount')
        .eq('type', 'expense')

      if (fetchError) {
        console.error(`Error fetching ${'expenses'}:`, fetchError)
        return []
      }

      return data
    } catch (error) {
      error.value = error
      console.error('Unexpected error fetching expenses:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchExpensesByCategory (month = null) {
    try {
      loading.value = true
      let query = supabase
        .from('transactions')
        .select(`
            budgets (
              categories (
                name
              )
            ),
            amount
          `)
        .eq('type', 'expense')

      if (month) {
        const startISO = moment(month).startOf('month').toISOString()
        const endISO = moment(month).endOf('month').toISOString()
        query = query.gte('date', startISO).lte('date', endISO)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching expenses:', fetchError)
        return []
      }

      const totalsByCategory = data.reduce((acc, row) => {
        const cat = row.budgets.categories.name ?? 'Uncategorized'
        const amount = Number(row.amount) || 0
        acc[cat] = (acc[cat] || 0) + amount
        return acc
      }, {})

      return Object.entries(totalsByCategory).map(([category, total]) => ({
        category,
        total,
      }))
    } catch (error) {
      console.error('Unexpected error fetching expenses:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchExpensesByPocket (month = null) {
    try {
      loading.value = true
      let query = supabase
        .from('transactions')
        .select(`
            pocket_id (
              name
            ),
            amount
          `)
        .eq('type', 'expense')

      if (month) {
        const startISO = moment(month).startOf('month').toISOString()
        const endISO = moment(month).endOf('month').toISOString()
        query = query.gte('date', startISO).lte('date', endISO)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching expenses:', fetchError)
        return []
      }

      const totalsByPocket = data.reduce((acc, row) => {
        const poc = row.pocket_id.name
        const amount = Number(row.amount) || 0
        acc[poc] = (acc[poc] || 0) + amount
        return acc
      }, {})

      return Object.entries(totalsByPocket).map(([pocket, total]) => ({
        pocket,
        total,
      }))
    } catch (error) {
      console.error('Unexpected error fetching expenses:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createExpense (expenseData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          type: 'expense',
          title: expenseData.title,
          amount: parseCurrency(expenseData.amount),
          date: moment(expenseData.date).toISOString(),
          pocket_id: expenseData.pocket,
          budget_id: expenseData.budget,
          notes: expenseData.notes,
        },
      ])
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${expenseData.title} created`, { color: 'success' })
    return { data, error: null }
  }

  async function updateExpense (id, expenseData) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        type: 'expense',
        title: expenseData.title,
        amount: parseCurrency(expenseData.amount),
        date: moment(expenseData.date).toISOString(),
        pocket_id: expenseData.pocket,
        budget_id: expenseData.budget,
        notes: expenseData.notes,
      })
      .eq('id', id)
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${expenseData.title} updated`, { color: 'success' })
    return { data, error: null }
  }

  async function deleteExpense (item) {
    try {
      await confirmation.open({
        title: `Delete ${item.title}`,
        message: `Are you sure you want to delete ${item.title}? This action cannot be undone.`,
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
        .from('transactions')
        .delete()
        .eq('id', item.id)

      if (error) {
        toast.push('Error occurred!', { color: 'error', timeout: 5000 })
        return { success: false, error }
      }

      toast.push(`${item.title} has been removed`, { color: 'success' })
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    } finally {
      confirmation.close()
    }
  }

  return {
    tables,
    loading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchTotalExpensesByMonth,
    fetchExpensesByDate,
    fetchExpensesByCategory,
    fetchExpensesByPocket,
  }
}

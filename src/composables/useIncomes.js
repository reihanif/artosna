import moment from 'moment'
import { reactive, ref } from 'vue'
import { useConfirmation } from '@/composables/useConfirmation'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
import { useToasts } from '@/composables/useToasts'
import { supabase } from '@/utils/supabase'

export function useIncomes () {
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

  async function fetchIncomes (page = 1) {
    tables.loading = true
    const firstItem = (page - 1) * tables.itemsPerPage
    const lastItem = firstItem + (tables.itemsPerPage - 1)

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
        categories (
          id,
          name
        ),
        notes,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('type', 'income')
      .order('created_at', { ascending: false })
      .range(firstItem, lastItem)

    if (error) {
      console.error(error)
      toast.push('Error fetching incomes', { color: 'error', timeout: 5000 })
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
        categoryId: item.categories?.id,
        category: item.categories?.name,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))
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

  async function fetchTotalIncomesByMonth (month) {
    try {
      loading.value = true
      const startISO = moment(month).startOf('month').toISOString()
      const endISO = moment(month).endOf('month').toISOString()

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'income')
        .gte('date', startISO)
        .lte('date', endISO)

      if (fetchError) {
        console.error(`Error fetching ${'incomes'}:`, fetchError)
        return []
      }

      return data?.reduce((sum, item) => sum + item.amount, 0) ?? 0
    } catch (error) {
      error.value = error
      console.error(`Unexpected error fetching ${'incomes'}:`, error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createIncome (incomeData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          type: 'income',
          title: incomeData.title,
          category_id: incomeData.category,
          amount: parseCurrency(incomeData.amount),
          date: moment(incomeData.date).toISOString(),
          pocket_id: incomeData.pocket,
          notes: incomeData.notes,
        },
      ])
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${data[0].title} created`, { color: 'success' })
    return { data, error: null }
  }

  async function updateIncome (id, incomeData) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        type: 'income',
        title: incomeData.title,
        category_id: incomeData.category,
        amount: parseCurrency(incomeData.amount),
        date: moment(incomeData.date).toISOString(),
        pocket_id: incomeData.pocket,
        notes: incomeData.notes,
      })
      .eq('id', id)
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${data[0].title} updated`, { color: 'success' })
    return { data, error: null }
  }

  async function deleteIncome (item) {
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
    fetchIncomes,
    createIncome,
    updateIncome,
    deleteIncome,
    fetchTotalIncomesByMonth,
  }
}

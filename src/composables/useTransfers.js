import moment from 'moment'
import { reactive } from 'vue'
import { useConfirmation } from '@/composables/useConfirmation'
import { useCurrencyFormatter } from '@/composables/useCurrencyFormatter'
import { useToasts } from '@/composables/useToasts'
import { supabase } from '@/utils/supabase'

export function useTransfers () {
  const toast = useToasts()
  const confirmation = useConfirmation()
  const { formatCurrency, parseCurrency } = useCurrencyFormatter()

  const tables = reactive({
    loading: true,
    headers: [
      { title: 'Date', key: 'date', sortable: false, width: 200 },
      { title: 'Title', key: 'title', sortable: false },
      { title: 'Source Wallet', key: 'pocket', sortable: false, width: 240 },
      { title: 'Destination Wallet', key: 'destinationPocket', sortable: false, width: 240 },
      { title: 'Amount', key: 'amount', sortable: false, width: 240 },
      { title: '', key: 'action', sortable: false, width: 50 },
    ],
    items: [],
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    totalPage: 1,
  })

  async function fetchTransfers (page = 1) {
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
        destination_pocket_id (
          id,
          name
        ),
        notes,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('type', 'transfer')
      .order('created_at', { ascending: false })
      .range(firstItem, lastItem)

    if (error) {
      console.error(error)
      toast.push('Error fetching transfers', { color: 'error', timeout: 5000 })
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
        destinationPocketId: item.destination_pocket_id.id,
        destinationPocket: item.destination_pocket_id.name,
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

  async function createTransfer (transferData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          type: 'transfer',
          title: transferData.title,
          amount: parseCurrency(transferData.amount),
          date: moment(transferData.date).toISOString(),
          pocket_id: transferData.pocket,
          destination_pocket_id: transferData.pocketDestination,
          notes: transferData.notes,
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

  async function updateTransfer (id, transferData) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        type: 'transfer',
        title: transferData.title,
        amount: parseCurrency(transferData.amount),
        date: moment(transferData.date).toISOString(),
        pocket_id: transferData.pocket,
        destination_pocket_id: transferData.pocketDestination,
        notes: transferData.notes,
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

  async function deleteTransfer (item) {
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
    fetchTransfers,
    createTransfer,
    updateTransfer,
    deleteTransfer,
  }
}

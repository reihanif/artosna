import { reactive } from 'vue'
import { useConfirmation } from '@/composables/useConfirmation'
import { useToasts } from '@/composables/useToasts'
import { supabase } from '@/utils/supabase'

export function useCategories () {
  const toast = useToasts()
  const confirmation = useConfirmation()

  const tables = reactive({
    loading: true,
    headers: [
      { title: 'Name', key: 'name', sortable: false },
      { title: 'Type', key: 'type', sortable: false, width: 300 },
      { title: '', key: 'action', sortable: false, width: 50 },
    ],
    items: [],
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    totalPage: 1,
  })

  async function fetchCategories (page = 1) {
    tables.loading = true
    const firstItem = (page - 1) * tables.itemsPerPage
    const lastItem = firstItem + (tables.itemsPerPage - 1)

    const { data, error, count } = await supabase
      .from('categories')
      .select('id, name, type', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(firstItem, lastItem)

    if (error) {
      console.error(error)
      toast.push('Error fetching categories', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.page = page
      tables.items = data
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

  async function fetchAllCategories () {
    tables.loading = true

    const { data, error, count } = await supabase
      .from('categories')
      .select('id, name, type', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      toast.push('Error fetching categories', { color: 'error', timeout: 5000 })
      tables.items = []
      tables.totalItems = 0
      tables.totalPage = 1
    } else if (count > 0) {
      tables.page = 1
      tables.items = data
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

  async function createCategory (categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: categoryData.name,
          type: categoryData.type,
        },
      ])
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${data[0].name} created`, { color: 'success' })
    return { data, error: null }
  }

  async function updateCategory (id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: categoryData.name,
        type: categoryData.type,
      })
      .eq('id', id)
      .select()

    if (error) {
      toast.push('Error occurred!', { color: 'error', timeout: 5000 })
      return { data: null, error }
    }

    toast.push(`${data[0].name} updated`, { color: 'success' })
    return { data, error: null }
  }

  async function deleteCategory (item) {
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
        .from('categories')
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
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchAllCategories,
  }
}

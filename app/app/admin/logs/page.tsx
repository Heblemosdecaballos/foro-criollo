
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { AdminLogs } from '@/components/admin/admin-logs'

interface LogsPageProps {
  searchParams: {
    action_type?: string
    admin_id?: string
    target_type?: string
    date_from?: string
    date_to?: string
    page?: string
  }
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin or moderator
  if (!user || (user.email !== 'admin@hablandodecaballos.com' && user.email !== 'moderator@hablandodecaballos.com')) {
    redirect('/')
  }

  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('admin_actions')
    .select(`
      *,
      user_profiles!admin_id(id, name, email, avatar_url)
    `)

  // Apply filters
  if (searchParams.action_type) {
    query = query.eq('action_type', searchParams.action_type)
  }

  if (searchParams.admin_id) {
    query = query.eq('admin_id', searchParams.admin_id)
  }

  if (searchParams.target_type) {
    query = query.eq('target_type', searchParams.target_type)
  }

  if (searchParams.date_from) {
    query = query.gte('created_at', searchParams.date_from)
  }

  if (searchParams.date_to) {
    query = query.lte('created_at', searchParams.date_to)
  }

  const { data: actions, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching admin actions:', error)
    return <div>Error loading logs</div>
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('admin_actions')
    .select('*', { count: 'exact', head: true })

  // Get available action types for filter
  const { data: actionTypes } = await supabase
    .from('admin_actions')
    .select('action_type')
    .order('action_type')

  const uniqueActionTypes = [...new Set(actionTypes?.map(a => a.action_type) || [])]

  // Get admins for filter
  const { data: admins } = await supabase
    .from('admin_roles')
    .select(`
      user_id,
      user_profiles!inner(id, name, email)
    `)
    .eq('is_active', true)

  return (
    <AdminLogs 
      actions={actions || []}
      totalCount={totalCount || 0}
      currentPage={page}
      limit={limit}
      actionTypes={uniqueActionTypes}
      admins={admins || []}
      filters={searchParams}
      currentUser={user}
    />
  )
}

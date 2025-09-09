
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'
import { UserManagementFilters } from '@/lib/types'

interface UserManagementPageProps {
  searchParams: UserManagementFilters
}

export default async function UserManagementPage({ searchParams }: UserManagementPageProps) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin or moderator
  if (!user || (user.email !== 'admin@hablandodecaballos.com' && user.email !== 'moderator@hablandodecaballos.com')) {
    redirect('/')
  }

  // Build query
  let query = supabase
    .from('user_profiles')
    .select(`
      *,
      user_levels(name, min_reputation, color),
      user_suspensions!inner(
        id, 
        suspension_type, 
        expires_at, 
        is_active,
        reason
      ),
      admin_roles(role, is_active)
    `)

  // Apply filters
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`)
  }

  if (searchParams.reputation_min) {
    query = query.gte('reputation_score', parseInt(searchParams.reputation_min.toString()))
  }

  if (searchParams.reputation_max) {
    query = query.lte('reputation_score', parseInt(searchParams.reputation_max.toString()))
  }

  if (searchParams.registration_date_from) {
    query = query.gte('created_at', searchParams.registration_date_from)
  }

  if (searchParams.registration_date_to) {
    query = query.lte('created_at', searchParams.registration_date_to)
  }

  // Apply sorting
  const sortBy = searchParams.sort_by || 'created_at'
  const sortOrder = searchParams.sort_order || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data: users, error } = await query.limit(50)

  if (error) {
    console.error('Error fetching users:', error)
    return <div>Error loading users</div>
  }

  // Get admin roles for dropdown
  const { data: adminRoles } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('is_active', true)

  return (
    <UserManagement 
      users={users || []}
      adminRoles={adminRoles || []}
      filters={searchParams}
      currentUser={user}
    />
  )
}

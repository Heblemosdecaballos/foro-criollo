
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { ReportManagement } from '@/components/admin/report-management'
import { ReportFilters } from '@/lib/types'

interface ReportManagementPageProps {
  searchParams: ReportFilters
}

export default async function ReportManagementPage({ searchParams }: ReportManagementPageProps) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin or moderator
  if (!user || (user.email !== 'admin@hablandodecaballos.com' && user.email !== 'moderator@hablandodecaballos.com')) {
    redirect('/')
  }

  // Build query
  let query = supabase
    .from('system_reports')
    .select(`
      *,
      user_profiles!reporter_id(id, name, email, avatar_url),
      user_profiles!assigned_to(id, name, email, avatar_url),
      user_profiles!resolved_by(id, name, email, avatar_url)
    `)

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.priority) {
    query = query.eq('priority', searchParams.priority)
  }

  if (searchParams.category) {
    query = query.eq('report_category', searchParams.category)
  }

  if (searchParams.reported_type) {
    query = query.eq('reported_type', searchParams.reported_type)
  }

  if (searchParams.assigned_to) {
    query = query.eq('assigned_to', searchParams.assigned_to)
  }

  if (searchParams.date_from) {
    query = query.gte('created_at', searchParams.date_from)
  }

  if (searchParams.date_to) {
    query = query.lte('created_at', searchParams.date_to)
  }

  // Apply sorting
  const sortBy = searchParams.sort_by || 'created_at'
  const sortOrder = searchParams.sort_order || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data: reports, error } = await query.limit(50)

  if (error) {
    console.error('Error fetching reports:', error)
    return <div>Error loading reports</div>
  }

  // Get available moderators for assignment
  const { data: moderators } = await supabase
    .from('admin_roles')
    .select(`
      user_id,
      role,
      user_profiles!inner(id, name, email, avatar_url)
    `)
    .eq('is_active', true)
    .in('role', ['admin', 'moderator'])

  // Get report stats for summary
  const { data: reportStats } = await supabase
    .rpc('get_report_stats')

  return (
    <ReportManagement 
      reports={reports || []}
      moderators={moderators || []}
      filters={searchParams}
      stats={reportStats || {}}
      currentUser={user}
    />
  )
}

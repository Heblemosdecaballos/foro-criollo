
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin or moderator
  if (!user || (user.email !== 'admin@hablandodecaballos.com' && user.email !== 'moderator@hablandodecaballos.com')) {
    redirect('/')
  }

  // Get admin role
  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  // Get dashboard stats
  const today = new Date().toISOString().split('T')[0]

  // Users stats
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: newUsersToday } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today)

  // Threads stats
  const { count: totalThreads } = await supabase
    .from('forum_threads')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)

  const { count: newThreadsToday } = await supabase
    .from('forum_threads')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .gte('created_at', today)

  // Replies stats
  const { count: totalReplies } = await supabase
    .from('forum_replies')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)

  const { count: newRepliesToday } = await supabase
    .from('forum_replies')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .gte('created_at', today)

  // Horses stats
  const { count: totalHorses } = await supabase
    .from('horses')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)

  const { count: newHorsesToday } = await supabase
    .from('horses')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .gte('created_at', today)

  // Reports stats
  const { count: pendingReports } = await supabase
    .from('system_reports')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'reviewing'])

  // Moderation queue stats
  const { count: pendingModeration } = await supabase
    .from('moderation_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Active suspensions
  const { count: activeSuspensions } = await supabase
    .from('user_suspensions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Recent reports for quick access
  const { data: recentReports } = await supabase
    .from('system_reports')
    .select(`
      *,
      user_profiles!reporter_id(name, email),
      user_profiles!assigned_to(name, email)
    `)
    .in('status', ['pending', 'reviewing'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent admin actions
  const { data: recentActions } = await supabase
    .from('admin_actions')
    .select(`
      *,
      user_profiles!admin_id(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // Pending moderation items
  const { data: moderationItems } = await supabase
    .from('moderation_queue')
    .select(`
      *,
      user_profiles!user_id(name, email),
      user_profiles!assigned_to(name, email)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = {
    total_users: totalUsers || 0,
    new_users_today: newUsersToday || 0,
    total_threads: totalThreads || 0,
    new_threads_today: newThreadsToday || 0,
    total_replies: totalReplies || 0,
    new_replies_today: newRepliesToday || 0,
    total_horses: totalHorses || 0,
    new_horses_today: newHorsesToday || 0,
    pending_reports: pendingReports || 0,
    pending_moderation: pendingModeration || 0,
    active_suspensions: activeSuspensions || 0,
    total_page_views: 0 // This would be implemented with analytics
  }

  return (
    <AdminDashboard 
      user={user}
      adminRole={adminRole}
      stats={stats}
      recentReports={recentReports || []}
      recentActions={recentActions || []}
      moderationItems={moderationItems || []}
    />
  )
}

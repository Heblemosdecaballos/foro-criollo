
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { UserProfileView } from '@/components/profiles/user-profile-view'

export default async function PerfilPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile with extended data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`
      *,
      user_levels(name, min_reputation, color)
    `)
    .eq('id', user.id)
    .single()

  // Get user activities
  const { data: activities } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get user settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get earned badges
  const { data: earnedBadges } = await supabase
    .from('user_earned_badges')
    .select(`
      *,
      badges(name, slug, description, icon, color, points)
    `)
    .eq('user_id', user.id)
    .eq('is_displayed', true)
    .order('earned_at', { ascending: false })

  // Get followers/following counts
  const { count: followersCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id)

  const { count: followingCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id)

  const userWithStats = {
    ...profile,
    activities_count: activities?.length || 0,
    badges_count: earnedBadges?.length || 0,
    followers_count: followersCount || 0,
    following_count: followingCount || 0
  }

  return (
    <UserProfileView 
      user={userWithStats}
      activities={activities || []}
      earnedBadges={earnedBadges || []}
      settings={settings}
      isOwnProfile={true}
    />
  )
}

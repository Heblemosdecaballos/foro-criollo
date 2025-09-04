
import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { UserProfileView } from '@/components/profiles/user-profile-view'

interface UsuarioPageProps {
  params: {
    id: string
  }
}

export default async function UsuarioPage({ params }: UsuarioPageProps) {
  const supabase = createServerSupabaseClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get target user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`
      *,
      user_levels(name, min_reputation, color)
    `)
    .eq('id', params.id)
    .single()

  if (!profile) {
    notFound()
  }

  // Check privacy settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('privacy_profile, privacy_activity, privacy_stats')
    .eq('user_id', params.id)
    .single()

  const isOwnProfile = currentUser?.id === params.id
  const canView = isOwnProfile || 
                  settings?.privacy_profile === 'public' || 
                  (settings?.privacy_profile === 'registered' && currentUser)

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Perfil Privado</h1>
          <p className="text-muted-foreground">Este perfil no está disponible públicamente.</p>
        </div>
      </div>
    )
  }

  const canViewActivity = isOwnProfile || settings?.privacy_activity !== 'private'
  const canViewStats = isOwnProfile || settings?.privacy_stats !== 'private'

  // Get user activities (if allowed)
  const { data: activities } = canViewActivity ? await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', params.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10) : { data: [] }

  // Get earned badges
  const { data: earnedBadges } = await supabase
    .from('user_earned_badges')
    .select(`
      *,
      badges(name, slug, description, icon, color, points)
    `)
    .eq('user_id', params.id)
    .eq('is_displayed', true)
    .order('earned_at', { ascending: false })

  // Get followers/following counts (if stats allowed)
  let followersCount = 0, followingCount = 0
  if (canViewStats) {
    const { count: fCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', params.id)

    const { count: fgCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', params.id)

    followersCount = fCount || 0
    followingCount = fgCount || 0
  }

  // Check if current user is following this user
  let isFollowing = false
  if (currentUser && currentUser.id !== params.id) {
    const { data: followData } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', params.id)
      .single()

    isFollowing = !!followData
  }

  const userWithStats = {
    ...profile,
    activities_count: activities?.length || 0,
    badges_count: earnedBadges?.length || 0,
    followers_count: followersCount,
    following_count: followingCount,
    is_following: isFollowing
  }

  return (
    <UserProfileView 
      user={userWithStats}
      activities={activities || []}
      earnedBadges={earnedBadges || []}
      settings={settings as any}
      isOwnProfile={isOwnProfile}
      canViewActivity={canViewActivity}
      canViewStats={canViewStats}
    />
  )
}

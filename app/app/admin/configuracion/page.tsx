
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SiteConfiguration } from '@/components/admin/site-configuration'

export default async function ConfigurationPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || user.email !== 'admin@hablandodecaballos.com') {
    redirect('/')
  }

  // Get all site settings grouped by category
  const { data: settings, error } = await supabase
    .from('site_settings')
    .select(`
      *,
      user_profiles!updated_by(name, email)
    `)
    .order('category', { ascending: true })
    .order('setting_key', { ascending: true })

  if (error) {
    console.error('Error fetching settings:', error)
    return <div>Error loading configuration</div>
  }

  // Group settings by category
  const settingsByCategory = (settings || []).reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, typeof settings>)

  return (
    <SiteConfiguration 
      settingsByCategory={settingsByCategory}
      currentUser={user}
    />
  )
}


'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  User as UserIcon,
  Settings,
  Shield,
  Bell,
  Upload,
  X,
  Plus,
  Save,
  ArrowLeft
} from 'lucide-react'
import { User, UserSettings, ProfileFormData, PrivacySettings, NotificationSettings } from '@/lib/types'
import { useSupabase } from '@/components/providers'
import { toast } from 'sonner'
import Link from 'next/link'

interface ProfileConfigViewProps {
  user: User
  settings?: UserSettings | null
}

export function ProfileConfigView({ user, settings }: ProfileConfigViewProps) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    phone: user.phone || '',
    website: user.website || '',
    birth_date: user.birth_date || '',
    experience_years: user.experience_years || 0,
    specialties: user.specialties || [],
    social_links: user.social_links || {},
    is_profile_public: user.is_profile_public ?? true,
    show_email: user.show_email ?? false,
    show_phone: user.show_phone ?? false,
    show_location: user.show_location ?? true,
    allow_messages: user.allow_messages ?? true,
    email_notifications: user.email_notifications ?? true
  })

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    notifications_email: settings?.notifications_email ?? true,
    notifications_push: settings?.notifications_push ?? true,
    notifications_forum: settings?.notifications_forum ?? true,
    notifications_marketplace: settings?.notifications_marketplace ?? true,
    notifications_hall: settings?.notifications_hall ?? true,
    email_notifications: user.email_notifications ?? true
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    privacy_profile: settings?.privacy_profile || 'public',
    privacy_activity: settings?.privacy_activity || 'public',
    privacy_stats: settings?.privacy_stats || 'public',
    show_email: user.show_email ?? false,
    show_phone: user.show_phone ?? false,
    show_location: user.show_location ?? true,
    allow_messages: user.allow_messages ?? true
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          phone: profileData.phone,
          website: profileData.website,
          birth_date: profileData.birth_date || null,
          experience_years: profileData.experience_years || null,
          specialties: profileData.specialties,
          social_links: profileData.social_links,
          is_profile_public: profileData.is_profile_public,
          show_email: profileData.show_email,
          show_phone: profileData.show_phone,
          show_location: profileData.show_location,
          allow_messages: profileData.allow_messages,
          email_notifications: profileData.email_notifications
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Perfil actualizado correctamente')
      router.push('/perfil')
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Upsert user settings
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notifications_email: notificationSettings.notifications_email,
          notifications_push: notificationSettings.notifications_push,
          notifications_forum: notificationSettings.notifications_forum,
          notifications_marketplace: notificationSettings.notifications_marketplace,
          notifications_hall: notificationSettings.notifications_hall,
          privacy_profile: privacySettings.privacy_profile,
          privacy_activity: privacySettings.privacy_activity,
          privacy_stats: privacySettings.privacy_stats,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Configuraciones guardadas')
    } catch (error) {
      console.error('Error al guardar configuraciones:', error)
      toast.error('Error al guardar las configuraciones')
    } finally {
      setIsLoading(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profileData.specialties.includes(newSpecialty.trim())) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  const addSocialLink = () => {
    if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
      setProfileData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [newSocialLink.platform]: newSocialLink.url
        }
      }))
      setNewSocialLink({ platform: '', url: '' })
    }
  }

  const removeSocialLink = (platform: string) => {
    setProfileData(prev => {
      const newLinks = { ...prev.social_links }
      delete newLinks[platform]
      return {
        ...prev,
        social_links: newLinks
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9DA] via-white to-[#EBDDCB] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración del Perfil
            </h1>
            <p className="text-muted-foreground mt-2">
              Personaliza tu perfil y ajusta tus preferencias de privacidad
            </p>
          </div>
          <Link href="/perfil">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al perfil
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="mr-2 h-5 w-5 text-amber-600" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-amber-600 text-white text-xl font-bold">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" type="button">
                      <Upload className="mr-2 h-4 w-4" />
                      Cambiar avatar
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ciudad, País"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+57 300 123 4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Sitio web</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://mi-sitio.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={profileData.birth_date}
                        onChange={(e) => setProfileData(prev => ({ ...prev, birth_date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience_years">Años de experiencia</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        max="100"
                        value={profileData.experience_years}
                        onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Cuéntanos sobre ti, tu experiencia ecuestre, tus caballos favoritos..."
                      rows={4}
                    />
                  </div>

                  {/* Specialties */}
                  <div>
                    <Label>Especialidades</Label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {profileData.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {specialty}
                            <button
                              type="button"
                              onClick={() => removeSpecialty(index)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newSpecialty}
                          onChange={(e) => setNewSpecialty(e.target.value)}
                          placeholder="Ej: Paso Fino, Doma, Salto"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                        />
                        <Button type="button" variant="outline" onClick={addSpecialty}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <Label>Redes sociales</Label>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        {Object.entries(profileData.social_links).map(([platform, url]) => (
                          <div key={platform} className="flex items-center gap-2">
                            <Badge variant="outline">{platform}</Badge>
                            <span className="flex-1 text-sm text-muted-foreground">{url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSocialLink(platform)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newSocialLink.platform}
                          onChange={(e) => setNewSocialLink(prev => ({ ...prev, platform: e.target.value }))}
                          placeholder="Plataforma (Instagram, Facebook, etc.)"
                        />
                        <Input
                          value={newSocialLink.url}
                          onChange={(e) => setNewSocialLink(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://..."
                        />
                        <Button type="button" variant="outline" onClick={addSocialLink}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="btn-equestrian">
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-amber-600" />
                    Configuración de Privacidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div>
                      <Label htmlFor="privacy_profile">Visibilidad del perfil</Label>
                      <Select 
                        value={privacySettings.privacy_profile} 
                        onValueChange={(value: 'public' | 'registered' | 'private') => 
                          setPrivacySettings(prev => ({ ...prev, privacy_profile: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Público - Visible para todos</SelectItem>
                          <SelectItem value="registered">Registrados - Solo usuarios registrados</SelectItem>
                          <SelectItem value="private">Privado - Solo yo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="privacy_activity">Visibilidad de actividad</Label>
                      <Select 
                        value={privacySettings.privacy_activity} 
                        onValueChange={(value: 'public' | 'registered' | 'private') => 
                          setPrivacySettings(prev => ({ ...prev, privacy_activity: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Público - Visible para todos</SelectItem>
                          <SelectItem value="registered">Registrados - Solo usuarios registrados</SelectItem>
                          <SelectItem value="private">Privado - Solo yo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="privacy_stats">Visibilidad de estadísticas</Label>
                      <Select 
                        value={privacySettings.privacy_stats} 
                        onValueChange={(value: 'public' | 'registered' | 'private') => 
                          setPrivacySettings(prev => ({ ...prev, privacy_stats: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Público - Visible para todos</SelectItem>
                          <SelectItem value="registered">Registrados - Solo usuarios registrados</SelectItem>
                          <SelectItem value="private">Privado - Solo yo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Información de contacto visible</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_email">Mostrar email</Label>
                      <Switch
                        id="show_email"
                        checked={privacySettings.show_email}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, show_email: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_phone">Mostrar teléfono</Label>
                      <Switch
                        id="show_phone"
                        checked={privacySettings.show_phone}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, show_phone: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_location">Mostrar ubicación</Label>
                      <Switch
                        id="show_location"
                        checked={privacySettings.show_location}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, show_location: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow_messages">Permitir mensajes privados</Label>
                      <Switch
                        id="allow_messages"
                        checked={privacySettings.allow_messages}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({ ...prev, allow_messages: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="btn-equestrian">
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5 text-amber-600" />
                    Configuración de Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications_email">Notificaciones por email</Label>
                        <p className="text-sm text-muted-foreground">Recibe notificaciones importantes por email</p>
                      </div>
                      <Switch
                        id="notifications_email"
                        checked={notificationSettings.notifications_email}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, notifications_email: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications_push">Notificaciones push</Label>
                        <p className="text-sm text-muted-foreground">Notificaciones en tiempo real en el navegador</p>
                      </div>
                      <Switch
                        id="notifications_push"
                        checked={notificationSettings.notifications_push}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, notifications_push: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications_forum">Notificaciones de foros</Label>
                        <p className="text-sm text-muted-foreground">Respuestas a tus temas y menciones</p>
                      </div>
                      <Switch
                        id="notifications_forum"
                        checked={notificationSettings.notifications_forum}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, notifications_forum: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications_marketplace">Notificaciones de marketplace</Label>
                        <p className="text-sm text-muted-foreground">Mensajes sobre tus anuncios</p>
                      </div>
                      <Switch
                        id="notifications_marketplace"
                        checked={notificationSettings.notifications_marketplace}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, notifications_marketplace: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications_hall">Notificaciones del Hall of Fame</Label>
                        <p className="text-sm text-muted-foreground">Votos y comentarios en tus caballos</p>
                      </div>
                      <Switch
                        id="notifications_hall"
                        checked={notificationSettings.notifications_hall}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, notifications_hall: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} className="btn-equestrian">
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

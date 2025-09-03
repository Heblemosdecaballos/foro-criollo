
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import Link from 'next/link'
import {
  User as UserIcon,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Mail,
  Settings,
  UserPlus,
  UserCheck,
  Heart,
  Trophy,
  Activity,
  Award,
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Edit
} from 'lucide-react'
import { User, UserActivity, UserEarnedBadge, UserSettings } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'
import { useSupabase } from '@/components/providers'
import { toast } from 'sonner'

interface UserProfileViewProps {
  user: User
  activities: UserActivity[]
  earnedBadges: UserEarnedBadge[]
  settings?: UserSettings | null
  isOwnProfile: boolean
  canViewActivity?: boolean
  canViewStats?: boolean
}

export function UserProfileView({
  user,
  activities,
  earnedBadges,
  settings,
  isOwnProfile,
  canViewActivity = true,
  canViewStats = true
}: UserProfileViewProps) {
  const { supabase } = useSupabase()
  const [isFollowing, setIsFollowing] = useState(user.is_following || false)
  const [followersCount, setFollowersCount] = useState(user.followers_count || 0)

  const handleFollow = async () => {
    if (!user.id) return

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('following_id', user.id)

        setIsFollowing(false)
        setFollowersCount(prev => prev - 1)
        toast.success('Has dejado de seguir a este usuario')
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({
            following_id: user.id
          })

        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
        toast.success('Ahora sigues a este usuario')
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error)
      toast.error('Error al procesar la acción')
    }
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'thread_created': return MessageSquare
      case 'reply_posted': return MessageSquare
      case 'horse_added': return Trophy
      case 'ad_published': return MessageSquare
      case 'media_uploaded': return Activity
      case 'badge_earned': return Award
      case 'level_up': return Trophy
      default: return Activity
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'thread_created': return 'text-blue-600'
      case 'reply_posted': return 'text-green-600'
      case 'horse_added': return 'text-amber-600'
      case 'ad_published': return 'text-purple-600'
      case 'media_uploaded': return 'text-pink-600'
      case 'badge_earned': return 'text-yellow-600'
      case 'level_up': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9DA] via-white to-[#EBDDCB] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Cover Image */}
        <div className="relative mb-8">
          <div className="h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-r from-amber-600/20 to-orange-600/20">
            {user.cover_image_url ? (
              <Image
                src={user.cover_image_url}
                alt="Imagen de portada"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-amber-600/20 to-orange-600/20 dark:from-amber-900/40 dark:to-orange-900/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Profile Header */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-amber-600 text-white text-2xl font-bold">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {user.name || 'Usuario'}
                    </h1>
                    {user.bio && (
                      <p className="text-white/90 text-lg max-w-2xl">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    {!isOwnProfile && (
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Siguiendo
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Seguir
                          </>
                        )}
                      </Button>
                    )}

                    {isOwnProfile && (
                      <Link href="/perfil/configuracion">
                        <Button variant="outline" className="bg-white text-gray-900 hover:bg-gray-100">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar perfil
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="mr-2 h-5 w-5 text-amber-600" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Se unió {formatRelativeDate(user.created_at)}</span>
                </div>

                {user.location && user.show_location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{user.location}</span>
                  </div>
                )}

                {user.phone && user.show_phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}

                {user.email && user.show_email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}

                {user.website && (
                  <div className="flex items-center text-sm">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700"
                    >
                      {user.website}
                    </a>
                  </div>
                )}

                {user.experience_years && (
                  <div className="flex items-center text-sm">
                    <Trophy className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{user.experience_years} años de experiencia</span>
                  </div>
                )}

                {user.specialties && user.specialties.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Especialidades</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            {canViewStats && (
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-amber-600" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{followersCount}</div>
                      <div className="text-sm text-muted-foreground">Seguidores</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{user.following_count}</div>
                      <div className="text-sm text-muted-foreground">Siguiendo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{user.reputation_score || 0}</div>
                      <div className="text-sm text-muted-foreground">Reputación</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{user.badges_count}</div>
                      <div className="text-sm text-muted-foreground">Badges</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <Card className="horse-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-amber-600" />
                    Badges Obtenidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {earnedBadges.slice(0, 8).map((earnedBadge) => (
                      <div
                        key={earnedBadge.id}
                        className="text-center p-3 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div className="text-2xl mb-1">{earnedBadge.badge?.icon}</div>
                        <div className="text-xs font-medium">{earnedBadge.badge?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeDate(earnedBadge.earned_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {earnedBadges.length > 8 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" size="sm">
                        Ver todos los badges
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
                <TabsTrigger value="about">Acerca de</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                {canViewActivity ? (
                  activities.length > 0 ? (
                    activities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.activity_type)
                      const iconColor = getActivityColor(activity.activity_type)
                      
                      return (
                        <Card key={activity.id} className="horse-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`flex-shrink-0 ${iconColor}`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{activity.title}</h4>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {activity.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatRelativeDate(activity.created_at)}
                                  </span>
                                  {activity.points_earned && activity.points_earned > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{activity.points_earned} puntos
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <Card className="horse-shadow">
                      <CardContent className="text-center py-12">
                        <Activity className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Sin actividad reciente</h3>
                        <p className="text-muted-foreground">
                          {isOwnProfile 
                            ? 'Comienza a participar en la comunidad para ver tu actividad aquí.'
                            : 'Este usuario no ha tenido actividad reciente.'}
                        </p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card className="horse-shadow">
                    <CardContent className="text-center py-12">
                      <EyeOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Actividad Privada</h3>
                      <p className="text-muted-foreground">
                        Este usuario ha configurado su actividad como privada.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card className="horse-shadow">
                  <CardHeader>
                    <CardTitle>Acerca de {user.name || 'este usuario'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.bio ? (
                      <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        {isOwnProfile ? 'Agrega una biografía para contarle a otros sobre ti.' : 'Este usuario no ha agregado una biografía.'}
                      </p>
                    )}

                    {user.social_links && Object.keys(user.social_links).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Redes sociales</h4>
                        <div className="space-y-2">
                          {Object.entries(user.social_links).map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-amber-600 hover:text-amber-700"
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

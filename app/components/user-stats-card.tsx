
'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Trophy, 
  MessageSquare, 
  Heart, 
  Star,
  TrendingUp,
  Award,
  Users
} from 'lucide-react'
import { UserStats } from '@/lib/types'
import { calculateUserLevel, getNextLevelProgress } from '@/lib/utils'

interface UserStatsCardProps {
  userStats?: UserStats
  showLeaderboard?: boolean
}

export function UserStatsCard({ userStats, showLeaderboard = true }: UserStatsCardProps) {
  if (!userStats) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-amber-600" />
            Tu perfil ecuestre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-amber-600 hover:underline">
              Inicia sesión
            </Link>
            {' '}para ver tus estadísticas y nivel en la comunidad.
          </p>
        </CardContent>
      </Card>
    )
  }

  const userLevel = calculateUserLevel(userStats.reputation_score)
  const progress = getNextLevelProgress(userStats.reputation_score)

  return (
    <div className="space-y-4">
      {/* User Level Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-amber-600" />
            Tu nivel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge 
              style={{ backgroundColor: userLevel.color, color: 'white' }}
              className="text-sm font-medium"
            >
              {userLevel.name}
            </Badge>
            <span className="text-sm font-medium">Nivel {userLevel.level}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{progress.current} / {progress.next} pts</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress.next - progress.current} puntos para el siguiente nivel
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-amber-600" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Posts</span>
            </div>
            <Badge variant="secondary">{userStats.total_posts}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm">Likes recibidos</span>
            </div>
            <Badge variant="secondary">{userStats.total_likes_received}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-sm">Caballos enviados</span>
            </div>
            <Badge variant="secondary">{userStats.total_horses_submitted}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Reputación</span>
            </div>
            <Badge variant="secondary">{Math.round(userStats.reputation_score)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Badges - Mock data for demo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Award className="mr-2 h-5 w-5 text-amber-600" />
            Logros recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 rounded-md bg-accent/50">
              <Award className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Primer Paso</p>
                <p className="text-xs text-muted-foreground">Publicaste tu primer mensaje</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-md bg-accent/50">
              <Award className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Hall de la Fama</p>
                <p className="text-xs text-muted-foreground">Agregaste tu primer caballo</p>
              </div>
            </div>
          </div>
          <Link href="/rankings" className="text-xs text-amber-600 hover:underline">
            Ver todos los logros
          </Link>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      {showLeaderboard && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-amber-600" />
              Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-amber-600">
                #{Math.floor(Math.random() * 100) + 1}
              </div>
              <p className="text-sm text-muted-foreground">
                Tu posición en el ranking general
              </p>
              <Link href="/rankings">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  Ver rankings completos
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

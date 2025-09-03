
'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { UserStatsCard } from './user-stats-card'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  ShoppingCart
} from 'lucide-react'
import { ForumStats, UserStats } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'

interface SidebarProps {
  stats?: ForumStats
  userStats?: UserStats
}

export function Sidebar({ stats, userStats }: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* User Stats */}
      <UserStatsCard userStats={userStats} />
      
      {/* Community Stats */}
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
              <span className="text-sm">Temas</span>
            </div>
            <Badge variant="secondary">{stats?.total_threads ?? 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <span className="text-sm">Respuestas</span>
            </div>
            <Badge variant="secondary">{stats?.total_replies ?? 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Usuarios</span>
            </div>
            <Badge variant="secondary">{stats?.total_users ?? 0}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats?.latest_activity && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-amber-600" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link 
                href={`/forums/${stats.latest_activity.category_slug}/${stats.latest_activity.thread_slug}`}
                className="block hover:bg-accent rounded-md p-2 transition-colors"
              >
                <h4 className="font-medium text-sm line-clamp-2">
                  {stats.latest_activity.thread_title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Por {stats.latest_activity.author_name} • {formatRelativeDate(stats.latest_activity.created_at)}
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Enlaces rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link
              href="/hall"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              🏆 Hall of Fame
            </Link>
            <Link
              href="/marketplace"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              🛒 Marketplace
            </Link>
            <Link
              href="/rankings"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              📊 Rankings
            </Link>
            <Link
              href="/galeria"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              📸 Galería multimedia
            </Link>
            <Link
              href="/buscar"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              🔍 Búsqueda avanzada
            </Link>
            <Link
              href="/ayuda"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ❓ Ayuda y FAQ
            </Link>
            <Link
              href="/forums/razas-y-cria"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              🐎 Razas y cría
            </Link>
            <Link
              href="/forums/cuidados-y-salud"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ❤️ Cuidados y salud
            </Link>
            <Link
              href="/forums/monta-y-entrenamiento"
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              🏇 Monta y entrenamiento
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

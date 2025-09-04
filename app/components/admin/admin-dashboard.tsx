
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  MessageSquare,
  Trophy,
  Flag,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Settings
} from 'lucide-react'
import { AdminStats, SystemReport, AdminAction, ModerationQueue } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'

interface AdminDashboardProps {
  user: any
  adminRole: any
  stats: AdminStats
  recentReports: SystemReport[]
  recentActions: AdminAction[]
  moderationItems: ModerationQueue[]
}

export function AdminDashboard({
  user,
  adminRole,
  stats,
  recentReports,
  recentActions,
  moderationItems
}: AdminDashboardProps) {
  const isAdmin = user?.email === 'admin@hablandodecaballos.com'

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'reviewing': return 'text-blue-600 bg-blue-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'dismissed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de Administración
          </h1>
          <div className="flex items-center space-x-2">
            <Badge variant={isAdmin ? 'default' : 'secondary'} className="bg-amber-600">
              {adminRole?.role || (isAdmin ? 'Administrador' : 'Moderador')}
            </Badge>
            <span className="text-muted-foreground">
              Bienvenido, {user?.email}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="horse-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Users className="mr-2 h-4 w-4 text-blue-600" />
                Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.new_users_today} hoy
              </p>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                Temas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_threads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.new_threads_today} hoy
              </p>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Trophy className="mr-2 h-4 w-4 text-amber-600" />
                Caballos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_horses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.new_horses_today} hoy
              </p>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Flag className="mr-2 h-4 w-4 text-red-600" />
                Reportes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pending_reports}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <Card className="horse-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Flag className="mr-2 h-5 w-5 text-red-600" />
                Reportes Recientes
              </CardTitle>
              <Link href="/admin/reportes">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="border-l-4 pl-4" style={{ borderLeftColor: getPriorityColor(report.priority).replace('bg-', '#') }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {report.report_category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(report.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{report.reported_type.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.description || 'Sin descripción'}
                      </p>
                      {report.reporter && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reportado por: {report.reporter.name || report.reporter.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>No hay reportes recientes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moderation Queue */}
          <Card className="horse-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-purple-600" />
                Cola de Moderación
              </CardTitle>
              <Link href="/admin/moderacion">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {moderationItems.length > 0 ? (
                <div className="space-y-4">
                  {moderationItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {item.content_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.priority}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(item.created_at)}
                        </span>
                      </div>
                      {item.flagged_reason && (
                        <p className="text-sm text-red-600 mb-1">
                          {item.flagged_reason}
                        </p>
                      )}
                      {item.user && (
                        <p className="text-xs text-muted-foreground">
                          Usuario: {item.user.name || item.user.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>No hay elementos pendientes de moderación</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Admin Actions */}
          <Card className="horse-shadow lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-blue-600" />
                Actividad Reciente del Equipo
              </CardTitle>
              <Link href="/admin/logs">
                <Button variant="outline" size="sm">
                  Ver logs completos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentActions.length > 0 ? (
                <div className="space-y-3">
                  {recentActions.map((action) => (
                    <div key={action.id} className="flex items-center space-x-4 py-2 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {action.action_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            por {action.admin?.name || action.admin?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {formatRelativeDate(action.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>No hay actividad reciente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="horse-shadow mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/usuarios">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <span>Gestionar Usuarios</span>
                </Button>
              </Link>

              <Link href="/admin/reportes">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Flag className="h-6 w-6 text-red-600" />
                  <div className="text-center">
                    <div>Ver Reportes</div>
                    {stats.pending_reports > 0 && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        {stats.pending_reports} pendientes
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>

              <Link href="/admin/moderacion">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <div className="text-center">
                    <div>Cola de Moderación</div>
                    {stats.pending_moderation > 0 && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {stats.pending_moderation} pendientes
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>

              {isAdmin && (
                <Link href="/admin/configuracion">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                    <Settings className="h-6 w-6 text-gray-600" />
                    <span>Configuración</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

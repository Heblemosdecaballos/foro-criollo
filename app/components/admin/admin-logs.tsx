
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Activity,
  Filter,
  Search,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { AdminAction } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

interface AdminLogsProps {
  actions: AdminAction[]
  totalCount: number
  currentPage: number
  limit: number
  actionTypes: string[]
  admins: any[]
  filters: any
  currentUser: any
}

export function AdminLogs({
  actions,
  totalCount,
  currentPage,
  limit,
  actionTypes,
  admins,
  filters,
  currentUser
}: AdminLogsProps) {
  const totalPages = Math.ceil(totalCount / limit)

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_suspend': return '🚫'
      case 'content_delete': return '🗑️'
      case 'report_resolve': return '✅'
      case 'badge_assign': return '🏆'
      case 'site_configuration': return '⚙️'
      case 'role_assign': return '👑'
      default: return '📋'
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'user_suspend': return 'text-red-600 bg-red-50'
      case 'content_delete': return 'text-orange-600 bg-orange-50'
      case 'report_resolve': return 'text-green-600 bg-green-50'
      case 'badge_assign': return 'text-purple-600 bg-purple-50'
      case 'site_configuration': return 'text-blue-600 bg-blue-50'
      case 'role_assign': return 'text-amber-600 bg-amber-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebddcb] via-[#ebddcb] to-[#ebddcb] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Logs de Administración
          </h1>
          <p className="text-muted-foreground">
            Historial completo de acciones realizadas por administradores y moderadores
          </p>
        </div>

        {/* Filters */}
        <Card className="horse-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={filters.action_type || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  {actionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.admin_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Administrador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los admins</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin.user_id} value={admin.user_id}>
                      {admin.user_profiles.name || admin.user_profiles.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.target_type || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="thread">Tema</SelectItem>
                  <SelectItem value="reply">Respuesta</SelectItem>
                  <SelectItem value="horse">Caballo</SelectItem>
                  <SelectItem value="report">Reporte</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Fecha desde"
                value={filters.date_from || ''}
              />

              <Input
                type="date"
                placeholder="Fecha hasta"
                value={filters.date_to || ''}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="horse-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Registro de Acciones ({totalCount.toLocaleString()})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acción</TableHead>
                  <TableHead>Administrador</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getActionIcon(action.action_type)}</span>
                        <Badge variant="outline" className={getActionColor(action.action_type)}>
                          {action.action_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={action.admin?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {action.admin?.name?.charAt(0) || action.admin?.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{action.admin?.name || action.admin?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-md line-clamp-2">{action.description}</p>
                    </TableCell>
                    <TableCell>
                      {action.target_type && (
                        <Badge variant="secondary" className="text-xs">
                          {action.target_type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeDate(action.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {action.ip_address || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {actions.length === 0 && (
              <div className="text-center py-12">
                <Activity className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-xl font-semibold mb-2">No hay acciones registradas</h3>
                <p className="text-muted-foreground">
                  Los logs de administración aparecerán aquí cuando se realicen acciones
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * limit + 1} a {Math.min(currentPage * limit, totalCount)} de {totalCount.toLocaleString()} registros
                </p>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href={`?${new URLSearchParams({ ...filters, page: (currentPage - 1).toString() }).toString()}`}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  >
                    <Button variant="outline" size="sm" disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                  </Link>

                  <span className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </span>

                  <Link
                    href={`?${new URLSearchParams({ ...filters, page: (currentPage + 1).toString() }).toString()}`}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  >
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

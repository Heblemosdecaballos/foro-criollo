
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Flag,
  Eye,
  Check,
  X,
  AlertTriangle,
  User,
  Clock,
  MessageSquare
} from 'lucide-react'
import { SystemReport, ReportFilters } from '@/lib/types'
import { formatRelativeDate } from '@/lib/utils'
import { useSupabase } from '@/components/providers'
import { toast } from 'sonner'

interface ReportManagementProps {
  reports: SystemReport[]
  moderators: any[]
  filters: ReportFilters
  stats: any
  currentUser: any
}

export function ReportManagement({ 
  reports, 
  moderators, 
  filters, 
  stats, 
  currentUser 
}: ReportManagementProps) {
  const { supabase } = useSupabase()
  const [selectedReport, setSelectedReport] = useState<SystemReport | null>(null)
  const [resolution, setResolution] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spam': return '🚫'
      case 'inappropriate': return '⚠️'
      case 'harassment': return '👥'
      case 'fake': return '🎭'
      case 'copyright': return '©️'
      default: return '❓'
    }
  }

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setIsResolving(true)
    
    try {
      const { error } = await supabase
        .from('system_reports')
        .update({
          status,
          resolution,
          resolved_at: new Date().toISOString(),
          resolved_by: currentUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.id,
          action_type: 'report_resolve',
          target_type: 'report',
          target_id: reportId,
          description: `Reporte ${status === 'resolved' ? 'resuelto' : 'descartado'}: ${resolution}`,
          metadata: { status, resolution }
        })

      toast.success(`Reporte ${status === 'resolved' ? 'resuelto' : 'descartado'} correctamente`)
      setSelectedReport(null)
      setResolution('')
      window.location.reload() // Refresh to show updated data
    } catch (error) {
      console.error('Error resolving report:', error)
      toast.error('Error al procesar el reporte')
    } finally {
      setIsResolving(false)
    }
  }

  const handleAssignReport = async (reportId: string, assignedTo: string) => {
    try {
      const { error } = await supabase
        .from('system_reports')
        .update({
          assigned_to: assignedTo,
          status: 'reviewing',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error

      toast.success('Reporte asignado correctamente')
      window.location.reload()
    } catch (error) {
      console.error('Error assigning report:', error)
      toast.error('Error al asignar el reporte')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Reportes
          </h1>
          <p className="text-muted-foreground">
            Revisa y resuelve reportes de contenido y usuarios
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="horse-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Flag className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{reports.filter(r => r.status === 'reviewing').length}</div>
                  <div className="text-sm text-muted-foreground">En revisión</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</div>
                  <div className="text-sm text-muted-foreground">Resueltos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="horse-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{reports.filter(r => r.priority === 'high' || r.priority === 'critical').length}</div>
                  <div className="text-sm text-muted-foreground">Alta prioridad</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card className="horse-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="mr-2 h-5 w-5 text-red-600" />
              Reportes ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporte</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryIcon(report.report_category)}</span>
                          <Badge variant="outline" className="text-xs">
                            {report.reported_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {report.report_category}
                          </Badge>
                        </div>
                        {report.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.reporter ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.reporter.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {report.reporter.name?.charAt(0) || report.reporter.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.reporter.name || 'Usuario'}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sistema</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(report.priority)}>
                        {report.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status === 'pending' ? 'Pendiente' :
                         report.status === 'reviewing' ? 'Revisando' :
                         report.status === 'resolved' ? 'Resuelto' : 'Descartado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.assigned_user ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.assigned_user.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {report.assigned_user.name?.charAt(0) || report.assigned_user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.assigned_user.name || 'Moderador'}</span>
                        </div>
                      ) : (
                        <Select 
                          value="" 
                          onValueChange={(value) => handleAssignReport(report.id, value)}
                          disabled={report.status === 'resolved' || report.status === 'dismissed'}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue placeholder="Asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            {moderators.map((mod) => (
                              <SelectItem key={mod.user_id} value={mod.user_id}>
                                {mod.user_profiles.name || mod.user_profiles.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeDate(report.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <Flag className="mr-2 h-5 w-5 text-red-600" />
                              Detalles del Reporte
                            </DialogTitle>
                            <DialogDescription>
                              Revisa los detalles y toma una acción sobre este reporte
                            </DialogDescription>
                          </DialogHeader>

                          {selectedReport && (
                            <div className="space-y-6">
                              {/* Report Details */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Información del Reporte</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Tipo:</span>
                                      <Badge variant="outline">{selectedReport.reported_type}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Categoría:</span>
                                      <Badge variant="secondary">{selectedReport.report_category}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Prioridad:</span>
                                      <Badge variant="outline" className={getPriorityColor(selectedReport.priority)}>
                                        {selectedReport.priority}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Estado:</span>
                                      <Badge variant="outline" className={getStatusColor(selectedReport.status)}>
                                        {selectedReport.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Fechas</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Creado:</span>
                                      <span>{formatRelativeDate(selectedReport.created_at)}</span>
                                    </div>
                                    {selectedReport.resolved_at && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Resuelto:</span>
                                        <span>{formatRelativeDate(selectedReport.resolved_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {selectedReport.description && (
                                <div>
                                  <h4 className="font-medium mb-2">Descripción</h4>
                                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                    {selectedReport.description}
                                  </p>
                                </div>
                              )}

                              {/* Resolution */}
                              {selectedReport.status === 'pending' || selectedReport.status === 'reviewing' ? (
                                <div>
                                  <h4 className="font-medium mb-2">Resolución</h4>
                                  <Textarea
                                    placeholder="Describe la acción tomada y la razón..."
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex space-x-2 mt-4">
                                    <Button
                                      onClick={() => handleResolveReport(selectedReport.id, 'resolved')}
                                      disabled={!resolution.trim() || isResolving}
                                      className="btn-equestrian"
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Resolver
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => handleResolveReport(selectedReport.id, 'dismissed')}
                                      disabled={!resolution.trim() || isResolving}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Descartar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                selectedReport.resolution && (
                                  <div>
                                    <h4 className="font-medium mb-2">Resolución</h4>
                                    <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg">
                                      {selectedReport.resolution}
                                    </p>
                                    {selectedReport.resolved_by_user && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Resuelto por: {selectedReport.resolved_by_user.name || selectedReport.resolved_by_user.email}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {reports.length === 0 && (
              <div className="text-center py-12">
                <Flag className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-xl font-semibold mb-2">No hay reportes</h3>
                <p className="text-muted-foreground">
                  Los reportes aparecerán aquí cuando sean enviados por los usuarios
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

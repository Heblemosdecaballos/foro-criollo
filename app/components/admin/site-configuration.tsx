
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Save, Shield, Bell, Globe, Code } from 'lucide-react'
import { SiteSetting } from '@/lib/types'
import { useSupabase } from '@/components/providers'
import { toast } from 'sonner'

interface SiteConfigurationProps {
  settingsByCategory: Record<string, SiteSetting[]>
  currentUser: any
}

export function SiteConfiguration({ settingsByCategory, currentUser }: SiteConfigurationProps) {
  const { supabase } = useSupabase()
  const [settings, setSettings] = useState(settingsByCategory)
  const [isSaving, setIsSaving] = useState(false)

  const handleSettingChange = (settingKey: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      for (const category in newSettings) {
        const setting = newSettings[category].find(s => s.setting_key === settingKey)
        if (setting) {
          setting.setting_value = value
          break
        }
      }
      return newSettings
    })
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    try {
      const allSettings = Object.values(settings).flat()
      
      for (const setting of allSettings) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            id: setting.id,
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            setting_type: setting.setting_type,
            category: setting.category,
            description: setting.description,
            is_public: setting.is_public,
            updated_by: currentUser.id,
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.id,
          action_type: 'site_configuration',
          description: 'Configuración del sitio actualizada',
          metadata: { updated_settings: allSettings.length }
        })

      toast.success('Configuración guardada correctamente')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const renderSettingInput = (setting: SiteSetting) => {
    const value = setting.setting_value

    switch (setting.setting_type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={setting.setting_key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleSettingChange(setting.setting_key, checked)}
            />
            <Label htmlFor={setting.setting_key}>{setting.description}</Label>
          </div>
        )

      case 'number':
        return (
          <div>
            <Label htmlFor={setting.setting_key}>{setting.setting_key.replace('_', ' ')}</Label>
            <Input
              id={setting.setting_key}
              type="number"
              value={value || ''}
              onChange={(e) => handleSettingChange(setting.setting_key, parseInt(e.target.value))}
            />
            {setting.description && (
              <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
            )}
          </div>
        )

      case 'text':
        return (
          <div>
            <Label htmlFor={setting.setting_key}>{setting.setting_key.replace('_', ' ')}</Label>
            <Textarea
              id={setting.setting_key}
              value={value || ''}
              onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
              rows={3}
            />
            {setting.description && (
              <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
            )}
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor={setting.setting_key}>{setting.setting_key.replace('_', ' ')}</Label>
            <Input
              id={setting.setting_key}
              value={value || ''}
              onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            />
            {setting.description && (
              <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
            )}
          </div>
        )
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return Globe
      case 'security': return Shield
      case 'notifications': return Bell
      case 'features': return Code
      default: return Settings
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E9DA] via-white to-[#EBDDCB] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Configuración del Sitio
            </h1>
            <p className="text-muted-foreground">
              Administra la configuración global de Hablando de Caballos
            </p>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="btn-equestrian"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(settings).map((category) => {
              const IconComponent = getCategoryIcon(category)
              return (
                <TabsTrigger key={category} value={category} className="flex items-center">
                  <IconComponent className="mr-2 h-4 w-4" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {Object.entries(settings).map(([category, categorySettings]) => {
            const IconComponent = getCategoryIcon(category)
            
            return (
              <TabsContent key={category} value={category}>
                <Card className="horse-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconComponent className="mr-2 h-5 w-5" />
                      Configuración de {category.charAt(0).toUpperCase() + category.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {categorySettings.map((setting) => (
                        <div key={setting.setting_key} className="border-b pb-4 last:border-b-0 last:pb-0">
                          {renderSettingInput(setting)}
                        </div>
                      ))}
                      
                      {categorySettings.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Settings className="mx-auto h-16 w-16 mb-4 opacity-30" />
                          <p>No hay configuraciones en esta categoría</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Default Settings Message */}
        {Object.keys(settings).length === 0 && (
          <Card className="horse-shadow">
            <CardContent className="text-center py-12">
              <Settings className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No hay configuraciones</h3>
              <p className="text-muted-foreground">
                Las configuraciones del sitio aparecerán aquí cuando se creen
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

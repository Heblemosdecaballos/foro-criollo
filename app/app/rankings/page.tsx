
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Trophy,
  Medal,
  Award,
  Star,
  MessageSquare,
  Heart,
  TrendingUp
} from 'lucide-react'
import Image from 'next/image'

// Mock data for demo - in real app would come from database
const mockLeaderboard = [
  { 
    id: '1',
    user: { name: 'Carlos Equestre', email: 'carlos@example.com' },
    total_posts: 150, 
    total_likes_received: 89, 
    total_horses_submitted: 12, 
    reputation_score: 1250,
    rank: 'Experto',
    level: 3
  },
  { 
    id: '2',
    user: { name: 'María del Campo', email: 'maria@example.com' },
    total_posts: 98, 
    total_likes_received: 156, 
    total_horses_submitted: 8, 
    reputation_score: 1100,
    rank: 'Experto',
    level: 3
  },
  { 
    id: '3',
    user: { name: 'Alejandro Paso Fino', email: 'alex@example.com' },
    total_posts: 120, 
    total_likes_received: 67, 
    total_horses_submitted: 15, 
    reputation_score: 980,
    rank: 'Experto',
    level: 3
  }
]

export default async function RankingsPage() {
  const supabase = createServerSupabaseClient()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#f5e9da] to-[#f5e9da] dark:from-[#4B2E2E] dark:via-[#3A2323] dark:to-[#2D1B1B]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Hall de la Fama - Comunidad
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white flex items-center justify-center flex-wrap">
            Rankings{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              Ecuestres
            </span>
            <Image 
              src="/paso-fino-colombiano.png" 
              alt="Paso Fino Colombiano" 
              width={50} 
              height={50} 
              className="ml-4"
            />
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Conoce a los miembros más activos y respetados de nuestra comunidad ecuestre.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Rankings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top 3 Podium */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-amber-600" />
                  Top 3 - Reputación General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {mockLeaderboard.slice(0, 3).map((entry, index) => {
                    const position = index + 1
                    const medal = position === 1 ? Trophy : position === 2 ? Medal : Award
                    const MedalIcon = medal
                    const medalColor = position === 1 ? 'text-yellow-500' : 
                                     position === 2 ? 'text-gray-400' : 'text-amber-600'
                    
                    return (
                      <div 
                        key={entry.id}
                        className={`text-center p-4 rounded-lg border ${
                          position === 1 ? 'bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950' :
                          position === 2 ? 'bg-gradient-to-b from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900' :
                          'bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950'
                        }`}
                      >
                        <MedalIcon className={`h-12 w-12 mx-auto mb-2 ${medalColor}`} />
                        <h3 className="font-bold text-lg">{entry.user?.name || 'Usuario'}</h3>
                        <Badge className={`mb-2 ${
                          position === 1 ? 'bg-yellow-500' :
                          position === 2 ? 'bg-gray-400' : 'bg-amber-500'
                        }`}>
                          #{position}
                        </Badge>
                        <div className="text-2xl font-bold text-amber-600">
                          {Math.round(entry.reputation_score)} pts
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.rank}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Rankings */}
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-amber-600" />
                  Ranking General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaderboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {entry.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{entry.user?.name || 'Usuario'}</h4>
                        <p className="text-sm text-muted-foreground">{entry.rank} - Nivel {entry.level}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-amber-600">
                          {Math.round(entry.reputation_score)} pts
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{entry.total_posts} posts</span>
                          <span>{entry.total_likes_received} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-md">
                      <Trophy className="h-4 w-4" />
                      <span>Datos de demostración - Configura Supabase para rankings reales</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Category Rankings */}
          <div className="space-y-6">
            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                  Top Participación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLeaderboard.map((entry, index) => (
                    <div key={`posts-${entry.id}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{entry.user?.name?.split(' ')[0] || 'Usuario'}</span>
                      </div>
                      <Badge variant="secondary">{entry.total_posts} posts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-red-600" />
                  Más queridos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...mockLeaderboard].sort((a, b) => b.total_likes_received - a.total_likes_received).map((entry, index) => (
                    <div key={`likes-${entry.id}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{entry.user?.name?.split(' ')[0] || 'Usuario'}</span>
                      </div>
                      <Badge variant="secondary">{entry.total_likes_received} likes</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="horse-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-amber-600" />
                  Hall of Fame
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...mockLeaderboard].sort((a, b) => b.total_horses_submitted - a.total_horses_submitted).map((entry, index) => (
                    <div key={`horses-${entry.id}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{entry.user?.name?.split(' ')[0] || 'Usuario'}</span>
                      </div>
                      <Badge variant="secondary">{entry.total_horses_submitted} caballos</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

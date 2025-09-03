
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSupabase } from './providers'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet'
import { 
  Search, 
  Plus, 
  User, 
  LogOut, 
  Menu, 
  Home,
  Trophy,
  MessageSquare,
  ShoppingCart,
  Image as ImageIcon,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, supabase } = useSupabase()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/forums', label: 'Foros', icon: MessageSquare },
    { href: '/hall', label: 'Hall of Fame', icon: Trophy },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { href: '/galeria', label: 'Galería', icon: ImageIcon },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-amber-600 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-amber-600 flex items-center">
                Hablando de Caballos
                <Image 
                  src="/paso-fino-colombiano.png" 
                  alt="Paso Fino Colombiano" 
                  width={24} 
                  height={24} 
                  className="ml-2"
                />
              </h1>
              <p className="text-xs text-muted-foreground">El punto de encuentro del caballo criollo colombiano</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar en el foro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Create Thread Button */}
            {user && (
              <Link href="/forums/create">
                <Button size="sm" className="hidden md:flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Crear tema</span>
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4">
                  <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold">Navegación</h2>
                  </div>
                  
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-accent"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Mobile Create Thread */}
                  {user && (
                    <Link href="/forums/create" className="pt-4">
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear tema
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

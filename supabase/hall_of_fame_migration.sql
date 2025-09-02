-- Hall of Fame Migration
-- Crear tablas para el sistema de Hall of Fame

-- Tabla de caballos
CREATE TABLE IF NOT EXISTS public.horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator TEXT,
  genealogy TEXT,
  additional_notes TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de galería de medios para caballos
CREATE TABLE IF NOT EXISTS public.horse_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  title TEXT,
  description TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de comentarios para elementos de la galería
CREATE TABLE IF NOT EXISTS public.gallery_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.horse_gallery(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.gallery_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de likes para elementos de galería
CREATE TABLE IF NOT EXISTS public.gallery_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.horse_gallery(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gallery_id, user_id)
);

-- Tabla de likes para comentarios
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.gallery_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_horses_featured ON public.horses(featured);
CREATE INDEX IF NOT EXISTS idx_horses_created_at ON public.horses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_horse_gallery_horse_id ON public.horse_gallery(horse_id);
CREATE INDEX IF NOT EXISTS idx_horse_gallery_created_at ON public.horse_gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_gallery_id ON public.gallery_comments(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_parent_id ON public.gallery_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_created_at ON public.gallery_comments(created_at DESC);

-- Función para actualizar el contador de likes en galería
CREATE OR REPLACE FUNCTION update_gallery_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.horse_gallery 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.gallery_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.horse_gallery 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.gallery_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar el contador de likes en comentarios
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gallery_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gallery_comments 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para mantener contadores actualizados
DROP TRIGGER IF EXISTS gallery_likes_count_trigger ON public.gallery_likes;
CREATE TRIGGER gallery_likes_count_trigger
  AFTER INSERT OR DELETE ON public.gallery_likes
  FOR EACH ROW EXECUTE FUNCTION update_gallery_likes_count();

DROP TRIGGER IF EXISTS comment_likes_count_trigger ON public.comment_likes;
CREATE TRIGGER comment_likes_count_trigger
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS horses_updated_at_trigger ON public.horses;
CREATE TRIGGER horses_updated_at_trigger
  BEFORE UPDATE ON public.horses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS gallery_comments_updated_at_trigger ON public.gallery_comments;
CREATE TRIGGER gallery_comments_updated_at_trigger
  BEFORE UPDATE ON public.gallery_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horse_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para horses
CREATE POLICY "horses_read_all" ON public.horses FOR SELECT USING (true);
CREATE POLICY "horses_insert_admin" ON public.horses FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horses_update_admin" ON public.horses FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horses_delete_admin" ON public.horses FOR DELETE USING (is_admin(auth.uid()));

-- Políticas RLS para horse_gallery
CREATE POLICY "horse_gallery_read_all" ON public.horse_gallery FOR SELECT USING (true);
CREATE POLICY "horse_gallery_insert_admin" ON public.horse_gallery FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horse_gallery_update_admin" ON public.horse_gallery FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "horse_gallery_delete_admin" ON public.horse_gallery FOR DELETE USING (is_admin(auth.uid()));

-- Políticas RLS para gallery_comments
CREATE POLICY "gallery_comments_read_all" ON public.gallery_comments FOR SELECT USING (true);
CREATE POLICY "gallery_comments_insert_auth" ON public.gallery_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "gallery_comments_update_own_or_admin" ON public.gallery_comments FOR UPDATE USING (user_id = auth.uid() OR is_admin(auth.uid())) WITH CHECK (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "gallery_comments_delete_own_or_admin" ON public.gallery_comments FOR DELETE USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Políticas RLS para gallery_likes
CREATE POLICY "gallery_likes_read_all" ON public.gallery_likes FOR SELECT USING (true);
CREATE POLICY "gallery_likes_insert_auth" ON public.gallery_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());
CREATE POLICY "gallery_likes_delete_own" ON public.gallery_likes FOR DELETE USING (user_id = auth.uid());

-- Políticas RLS para comment_likes
CREATE POLICY "comment_likes_read_all" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert_auth" ON public.comment_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());
CREATE POLICY "comment_likes_delete_own" ON public.comment_likes FOR DELETE USING (user_id = auth.uid());

-- Datos de ejemplo para desarrollo
INSERT INTO public.horses (name, creator, genealogy, additional_notes, featured) VALUES 
('Relámpago de Oro', 'Hacienda El Dorado', 'Hijo de Trueno Real x Estrella Dorada', 'Campeón nacional de paso fino 2023. Ejemplar excepcional con gran temperamento y elegancia en su andar.', true),
('Majestuoso', 'Criadero Los Andes', 'Descendiente de Emperador x Bella Vista', 'Reconocido por su perfecta conformación y suavidad en el paso. Múltiples premios en competencias regionales.', true),
('Diamante Negro', 'Finca La Esperanza', 'Linaje de Carbón Real x Perla Negra', 'Ejemplar de gran alzada y presencia. Destacado reproductor con excelente descendencia.', false)
ON CONFLICT DO NOTHING;

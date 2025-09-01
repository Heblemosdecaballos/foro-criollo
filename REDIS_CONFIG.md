# Configuración de Redis

## Estado Actual
Redis es **OPCIONAL** en esta aplicación. La aplicación funcionará correctamente sin Redis, pero algunas funcionalidades avanzadas estarán limitadas.

## Funcionalidades que usan Redis

### ✅ Funciona SIN Redis:
- Navegación y funcionalidad básica del foro
- Autenticación de usuarios
- Creación y visualización de posts
- Comentarios y votaciones
- WebSocket en modo standalone (una sola instancia)

### ⚠️ Limitado SIN Redis:
- **Cache de datos**: No se guardará cache, pero la app funcionará normalmente
- **Notificaciones Push**: Las suscripciones no se persistirán entre reinicios
- **Estadísticas del sistema**: Mostrará valores por defecto
- **WebSocket escalabilidad**: Solo funciona en una instancia (no distribuido)

## Configuración para Producción

### Opción 1: Sin Redis (Recomendado para Vercel)
```bash
# En .env.local, mantener comentado:
# REDIS_URL=redis://localhost:6379
```

### Opción 2: Con Redis externo
Para habilitar todas las funcionalidades, configura un servicio Redis externo:

#### Upstash Redis (Recomendado para Vercel)
1. Crear cuenta en [Upstash](https://upstash.com/)
2. Crear una base de datos Redis
3. Copiar la URL de conexión
4. Agregar a variables de entorno:
```bash
REDIS_URL=rediss://default:password@host:port
```

#### Redis Cloud
1. Crear cuenta en [Redis Cloud](https://redis.com/cloud/)
2. Crear una base de datos
3. Obtener la URL de conexión
4. Configurar variable de entorno

#### Railway/Render
Ambos servicios ofrecen Redis como addon.

## Variables de Entorno

```bash
# Opcional - Solo si quieres habilitar Redis
REDIS_URL=redis://localhost:6379  # Para desarrollo local
# o
REDIS_URL=rediss://user:pass@host:port  # Para producción
```

## Verificación del Estado

La aplicación incluye un monitor en `/admin/realtime` que muestra:
- 🟢 **Conectado**: Redis funcionando correctamente
- 🟡 **Deshabilitado**: Redis no configurado (funcionamiento normal)
- 🔴 **Error**: Redis configurado pero no accesible

## Desarrollo Local

### Con Redis:
```bash
# Instalar Redis
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu

# Iniciar Redis
redis-server

# Descomentar en .env.local:
REDIS_URL=redis://localhost:6379
```

### Sin Redis:
```bash
# Mantener comentado en .env.local:
# REDIS_URL=redis://localhost:6379

# La aplicación funcionará normalmente
npm run dev
```

## Logs y Debugging

La aplicación mostrará logs claros sobre el estado de Redis:
- `✅ Redis conectado exitosamente`
- `⚠️ Redis no disponible, cache no guardado`
- `❌ Error conectando a Redis`

## Recomendaciones

1. **Para desarrollo**: Usar sin Redis para simplicidad
2. **Para producción básica**: Usar sin Redis en Vercel
3. **Para producción avanzada**: Configurar Upstash Redis
4. **Para alta escala**: Usar Redis Cloud o instancia dedicada

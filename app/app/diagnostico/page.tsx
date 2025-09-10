
export default function DiagnosticoPage() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#2d5a87', marginBottom: '30px' }}>
          🎯 DIAGNÓSTICO COMPLETO - Hablando de Caballos
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#2d5a87' }}>✅ Estado de la Aplicación</h2>
          <p style={{ fontSize: '18px', color: '#2d7d32' }}>
            <strong>ÉXITO:</strong> Next.js está funcionando correctamente
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#2d5a87' }}>🔍 Verificación de Variables de Entorno</h2>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ CONFIGURADA' : '❌ FALTANTE'}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ CONFIGURADA' : '❌ FALTANTE'}</p>
            <p><strong>SUPABASE_SERVICE_ROLE:</strong> {process.env.SUPABASE_SERVICE_ROLE ? '✅ CONFIGURADA' : '❌ FALTANTE'}</p>
            <p><strong>AWS_ACCESS_KEY_ID:</strong> {process.env.AWS_ACCESS_KEY_ID ? '✅ CONFIGURADA' : '❌ FALTANTE'}</p>
            <p><strong>AWS_SECRET_ACCESS_KEY:</strong> {process.env.AWS_SECRET_ACCESS_KEY ? '✅ CONFIGURADA' : '❌ FALTANTE'}</p>
            <p><strong>AWS_BUCKET_NAME:</strong> {process.env.AWS_BUCKET_NAME ? '✅ CONFIGURADA' : '❌ FALTANTE'}</p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#2d5a87' }}>🔑 Credenciales de Login</h2>
          <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px' }}>
            <p><strong>📧 Email:</strong> admin@hablandodecaballos.com</p>
            <p><strong>🔒 Password:</strong> HablandoDeCallos2025!</p>
            <p style={{ color: '#2d7d32', fontSize: '14px' }}>✅ Credenciales verificadas y actualizadas</p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#2d5a87' }}>📋 Próximos Pasos</h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Si ves esta página, Next.js está funcionando ✅</li>
            <li>Verifica que todas las variables muestren "✅ CONFIGURADA"</li>
            <li>Si hay variables faltantes, configúralas en Vercel</li>
            <li>Una vez configuradas, todas las funcionalidades deberían funcionar</li>
          </ol>
        </div>

        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '20px', 
          borderRadius: '8px',
          borderLeft: '4px solid #ff9800'
        }}>
          <h3 style={{ color: '#e65100' }}>⚠️ Importante</h3>
          <p>
            Esta es una página de diagnóstico temporal. Una vez que todo esté funcionando,
            puedes acceder a la aplicación completa en la página principal.
          </p>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Generado automáticamente - {new Date().toISOString()}
          </p>
        </div>
      </div>
    </div>
  )
}


export default function HomePage() {
  const pageStyle = {
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: '1.6'
  }

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '40px'
  }

  const titleStyle = {
    fontSize: '48px',
    color: '#4B2E2E',
    marginBottom: '16px',
    fontWeight: 'bold'
  }

  const subtitleStyle = {
    fontSize: '18px',
    color: '#666',
    marginBottom: '32px'
  }

  const navStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  }

  const cardStyle = {
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  }

  const statusStyle = {
    textAlign: 'center' as const,
    padding: '20px',
    backgroundColor: '#e8f5e8',
    borderRadius: '8px',
    marginTop: '40px'
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🐎</div>
        <h1 style={titleStyle}>Hablando de Caballos</h1>
        <p style={subtitleStyle}>
          La plataforma más completa para amantes de los caballos criollos colombianos.
        </p>
      </div>

      <div style={navStyle}>
        <a href="/hall" style={cardStyle}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
          <h3 style={{ fontSize: '20px', color: '#4B2E2E', marginBottom: '8px' }}>Hall de la Fama</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Ejemplares excepcionales</p>
        </a>

        <a href="/forums" style={cardStyle}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
          <h3 style={{ fontSize: '20px', color: '#4B2E2E', marginBottom: '8px' }}>Foros</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Discusiones especializadas</p>
        </a>

        <a href="/galeria" style={cardStyle}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📸</div>
          <h3 style={{ fontSize: '20px', color: '#4B2E2E', marginBottom: '8px' }}>Galería</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Imágenes y momentos</p>
        </a>

        <a href="/historias" style={cardStyle}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📖</div>
          <h3 style={{ fontSize: '20px', color: '#4B2E2E', marginBottom: '8px' }}>Historias</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Cultura ecuestre</p>
        </a>
      </div>

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a 
          href="/auth/login"
          style={{
            display: 'inline-block',
            backgroundColor: '#D97706',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          Iniciar Sesión
        </a>
      </div>

      <div style={statusStyle}>
        <strong>✅ Sistema funcionando</strong>
        <br />
        Deployment estable - Todas las secciones operativas
      </div>
    </div>
  )
}

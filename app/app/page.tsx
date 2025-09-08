
export default function HomePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">🐎</span>
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4B2E2E]">
            Hablando de Caballos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            La plataforma más completa para amantes de los caballos criollos colombianos.
          </p>
        </div>

        {/* Navigation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          <a 
            href="/hall" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-amber-200"
          >
            <div className="text-center space-y-3">
              <div className="text-3xl">🏆</div>
              <h3 className="text-xl font-semibold text-[#4B2E2E]">Hall de la Fama</h3>
              <p className="text-sm text-gray-600">Ejemplares excepcionales</p>
            </div>
          </a>

          <a 
            href="/forums" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-blue-200"
          >
            <div className="text-center space-y-3">
              <div className="text-3xl">💬</div>
              <h3 className="text-xl font-semibold text-[#4B2E2E]">Foros</h3>
              <p className="text-sm text-gray-600">Discusiones especializadas</p>
            </div>
          </a>

          <a 
            href="/galeria" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-green-200"
          >
            <div className="text-center space-y-3">
              <div className="text-3xl">📸</div>
              <h3 className="text-xl font-semibold text-[#4B2E2E]">Galería</h3>
              <p className="text-sm text-gray-600">Imágenes y momentos</p>
            </div>
          </a>

          <a 
            href="/historias" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-purple-200"
          >
            <div className="text-center space-y-3">
              <div className="text-3xl">📖</div>
              <h3 className="text-xl font-semibold text-[#4B2E2E]">Historias</h3>
              <p className="text-sm text-gray-600">Cultura ecuestre</p>
            </div>
          </a>
        </div>

        {/* Login */}
        <div className="pt-8">
          <a 
            href="/auth/login"
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>

        {/* Status */}
        <div className="pt-8 text-sm text-gray-500">
          ✅ Versión simplificada - Sistema funcionando
        </div>
      </div>
    </div>
  )
}

export default function SiteFooter() {
  return (
    <footer className="mt-12">
      <div className="container-page grid gap-8 border-t border-black/10 py-10 md:grid-cols-3">
        <div>
          <div className="mb-2 text-lg font-heading">Hablando de Caballos</div>
          <p className="text-sm text-black/70 dark:text-white/70">
            Comunidad del Caballo Criollo Colombiano. Historias, noticias y foro.
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-heading">Secciones</div>
          <ul className="space-y-1">
            <li><a href="/noticias" className="hover:underline">Noticias</a></li>
            <li><a href="/historias" className="hover:underline">Historias</a></li>
            <li><a href="/threads" className="hover:underline">Foro</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-heading">Legal</div>
          <ul className="space-y-1">
            <li><a href="/politica" className="hover:underline">Política de Privacidad</a></li>
            <li><a href="/terminos" className="hover:underline">Términos y Condiciones</a></li>
            <li><a href="/contacto" className="hover:underline">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/10 py-4 text-center text-xs text-black/60 dark:text-white/60">
        © {new Date().getFullYear()} Hablando de Caballos
      </div>
    </footer>
  );
}

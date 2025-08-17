export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-black/5">
      <div className="container-page py-8 grid gap-6 sm:grid-cols-3">
        <div>
          <div className="text-lg font-semibold mb-2">Hablando de Caballos</div>
          <p className="text-sm text-black/60 dark:text-white/60">
            Comunidad del Caballo Criollo Colombiano. Historias, noticias y foro.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-medium mb-2">Secciones</div>
          <ul className="space-y-1">
            <li><a href="/noticias" className="hover:underline">Noticias</a></li>
            <li><a href="/historias" className="hover:underline">Historias</a></li>
            <li><a href="/threads" className="hover:underline">Foro</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-medium mb-2">Legal</div>
          <ul className="space-y-1">
            <li><a href="/politica" className="hover:underline">Política de Privacidad</a></li>
            <li><a href="/terminos" className="hover:underline">Términos y Condiciones</a></li>
            <li><a href="/contacto" className="hover:underline">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 text-center text-xs py-4 text-black/60 dark:text-white/60">
        © {new Date().getFullYear()} Hablando de Caballos
      </div>
    </footer>
  );
}

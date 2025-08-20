// ...dentro del header, donde muestras los botones...
{isLogged ? (
  <>
    <Link href="/perfil" className="btn btn-ghost">Perfil</Link>
    <SignOutButton />
  </>
) : (
  <Link href="/auth" className="btn btn-ghost">Iniciar sesión</Link>
)}

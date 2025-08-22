'use client'

export default function SignOutButton() {
  const onClick = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={onClick}>
      Salir
    </button>
  )
}

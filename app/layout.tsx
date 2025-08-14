import { Cinzel, Montserrat } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400','700'] })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300','400','500','700'] })

export const metadata = {
  title: 'Hablemos de Caballos',
  description: 'Foro del Caballo Criollo Colombiano'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.className}`}>
      <body className="bg-beige text-marron">{children}</body>
    </html>
  )
}

// app/layout.tsx (SERVER COMPONENT)
import './globals.css';

export const metadata = {
  title: 'Hablemos de Caballos',
  description: 'Foros de Hablemos de Caballos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}

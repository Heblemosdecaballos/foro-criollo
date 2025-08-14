// app/layout.tsx (SERVER COMPONENT)
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
      <body>{children}</body>
    </html>
  );
}

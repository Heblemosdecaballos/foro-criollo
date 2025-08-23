import "./globals.css";
import NavBar from "@/src/components/NavBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Listener no es necesario si usamos middleware para sesión */}
        <NavBar />
        {children}
      </body>
    </html>
  );
}

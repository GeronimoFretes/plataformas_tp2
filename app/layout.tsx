import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cocin.IA",
  // description: "Chef-AI: tu asistente de cocina con IA en vivo",
  // generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />

        <link
          href="https://fonts.googleapis.com/css2?family=Glacial+Indifference&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-crema text-verde font-sans">{children}</body>
    </html>
  )
}

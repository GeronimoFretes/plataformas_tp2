import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cocin.IA",
  // description: "Cocin.IA: your live AI cooking assistant",
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

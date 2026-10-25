import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "LULUCA | Moda Infantil",
  description: "Moda infantil nova e seminova com curadoria e carinho. Peças únicas, preços justos e envio para todo o Brasil.",
  keywords: ["moda infantil", "roupas infantis", "desapego", "seminovas", "bebes", "meninas", "meninos", "luluca"],
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e2a44',
              borderRadius: '12px',
              border: '1px solid #e2d3b3',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}

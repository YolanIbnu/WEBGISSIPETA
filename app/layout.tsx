import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/app-context";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SIPETA - Sistem Informasi Peta TPK",
  description: "Sistem Manajemen Persediaan Kayu Terpadu untuk monitoring dan kontrol stok real-time dengan teknologi GIS terkini",
  // CRITICAL: Prevent ALL caching to ensure real-time data
  other: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* CRITICAL: Leaflet CSS for map tiles */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />

        {/* CRITICAL META TAGS: Force no-cache on mobile browsers */}
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}

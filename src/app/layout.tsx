import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components";
import { ProtectedRoute } from "@/components";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { AsyncStyleLoader } from "@/components/shared/AsyncStyleLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "WasteCare - Smart Waste Management",
  description: "Smart waste management application for reporting and tracking waste issues in your community",
  keywords: ["waste management", "environment", "community", "reporting", "sustainability"],
  authors: [{ name: "WasteCare Team" }],
  creator: "WasteCare Team",
  publisher: "WasteCare Team",
  applicationName: "WasteCare",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WasteCare",
    startupImage: "/icons/apple-touch-startup-image.png",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logos/wastecare-no-text.png", sizes: "16x16", type: "image/png" },
      { url: "/logos/wastecare-no-text.png", sizes: "32x32", type: "image/png" },
      { url: "/logos/wastecare-no-text.png", sizes: "192x192", type: "image/png" },
      { url: "/logos/wastecare-no-text.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logos/wastecare-no-text.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logos/wastecare-no-text.png",
        color: "#16a34a",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "WasteCare",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#16a34a",
    "msapplication-config": "/browserconfig.xml",
    "google-site-verification": "Xc0I0NlFkYLtm1os5ld86ki1HSGsZlIQhJWWu3DgXa8",
  },
  openGraph: {
    type: "website",
    title: "WasteCare - Smart Waste Management",
    description: "Smart waste management application for reporting and tracking waste issues in your community",
    siteName: "WasteCare",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "WasteCare - Smart Waste Management",
    description: "Smart waste management application for reporting and tracking waste issues in your community",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.maptiler.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://api.maptiler.com" />
        
        {/* Use system fonts with similar characteristics to CircularStd */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}} />
        
        {/* Back/Forward Cache restoration support */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
              // Refresh dynamic content if needed
              if (window.location.pathname.includes('/dashboard') || 
                  window.location.pathname.includes('/campaign') ||
                  window.location.pathname.includes('/leaderboard')) {
                window.location.reload();
              }
            }
          });
          
          // Mark page as bfcache-eligible
          window.addEventListener('pagehide', function(event) {
            // Allow bfcache by not having any blocking operations
          });
        `}} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AsyncStyleLoader />
        <AuthProvider>
          <ProtectedRoute>
            <ClientProviders>
              {children}
            </ClientProviders>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}

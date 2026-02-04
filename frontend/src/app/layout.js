import './globals.css'

import { DashboardProvider } from '../context/DashboardContext';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
    themeColor: '#0a0e1a',
}

export const metadata = {
    title: 'Nokia NOC - Intelligent Fronthaul Optimization',
    description: 'Real-time 5G fronthaul network monitoring and AI-powered optimization',
    icons: {
        icon: '/nokia-icon.png',
        shortcut: '/nokia-icon.png',
        apple: '/nokia-icon.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Nokia NOC'
    }
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Mobile Meta Tags */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="format-detection" content="telephone=no" />

                {/* Safe area insets for notched devices */}
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

                {/* Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <DashboardProvider>
                    {children}
                </DashboardProvider>
            </body>
        </html>
    )
}

import './globals.css'

import { DashboardProvider } from '../context/DashboardContext';

export const metadata = {
    title: 'Nokia Hackathon - Fronthaul Network Optimization',
    description: 'Day-3 Demo: Intelligent Fronthaul Network Optimization',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
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

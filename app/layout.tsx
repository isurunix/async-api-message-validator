import { ThemeProvider } from '@/components/providers/theme-provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AsyncAPI Message Validator',
  description: 'Validate your AsyncAPI message payloads with ease. Supports AsyncAPI 2.x and 3.0 specifications.',
  keywords: ['AsyncAPI', 'validation', 'message', 'schema', 'API'],
  authors: [{ name: 'AsyncAPI Validator Team' }],
  openGraph: {
    title: 'AsyncAPI Message Validator',
    description: 'Validate your AsyncAPI message payloads with ease',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

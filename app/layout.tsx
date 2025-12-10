import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'

import ConfirmationDialog from '@/components/confirmation-dialog'
import { Toaster } from '@/components/ui/sonner'
import StoreProvider from '@/lib/store/StoreProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cars Data Grid Example',
  description: 'An example app that implements a data-grid and detail view for cars',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          <StoreProvider>
            <main className="min-h-screen max-w-7xl mx-auto flex flex-col px-4 sm:px-6 lg:px-8">
              {children}
            </main>
            <Toaster />
            <ConfirmationDialog />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

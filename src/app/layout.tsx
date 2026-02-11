import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AL-BURHAN Industrial Drives',
  description: 'Internal Business Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}

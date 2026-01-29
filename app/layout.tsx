import type { Metadata } from 'next'
import { Inter, Great_Vibes, Raleway, Barlow } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'], variable: '--font-script' })
const raleway = Raleway({ subsets: ['latin'], variable: '--font-display' })
const barlow = Barlow({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-barlow' })

export const metadata: Metadata = {
  title: 'Obsidian Social Club | Monclova',
  description: 'La discoteca más exclusiva de Monclova, Coahuila. Reserva tu mesa y vive una experiencia única.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${greatVibes.variable} ${raleway.variable} ${barlow.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}

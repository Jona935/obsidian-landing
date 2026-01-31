import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menú',
  description: 'Descubre nuestra carta de cócteles signature, shots, cervezas premium y botellas en Obsidian Social Club. Los mejores tragos de Monclova.',
  openGraph: {
    title: 'Menú | Obsidian Social Club',
    description: 'Cócteles signature, shots especiales y botellas premium en la mejor discoteca de Monclova.',
  },
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

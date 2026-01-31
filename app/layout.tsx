import type { Metadata } from 'next'
import { Inter, Great_Vibes, Raleway, Barlow } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'], variable: '--font-script' })
const raleway = Raleway({ subsets: ['latin'], variable: '--font-display' })
const barlow = Barlow({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-barlow' })

export const metadata: Metadata = {
  title: {
    default: 'Obsidian Social Club | La Discoteca Premium de Monclova',
    template: '%s | Obsidian Social Club'
  },
  description: 'Obsidian Social Club - La discoteca más exclusiva de Monclova, Coahuila. Vive noches únicas con los mejores DJs, música electrónica, y ambiente premium. Reserva tu mesa ahora.',
  keywords: [
    'discoteca Monclova',
    'antro Monclova',
    'club nocturno Monclova',
    'Obsidian Social Club',
    'vida nocturna Monclova',
    'reservaciones Monclova',
    'DJs Monclova',
    'música electrónica Coahuila',
    'fiesta Monclova',
    'nightclub Monclova',
    'eventos Monclova',
    'bar premium Monclova'
  ],
  authors: [{ name: 'Obsidian Social Club' }],
  creator: 'Obsidian Social Club',
  publisher: 'Obsidian Social Club',
  metadataBase: new URL('https://www.obsidianmva.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://www.obsidianmva.com',
    siteName: 'Obsidian Social Club',
    title: 'Obsidian Social Club | La Discoteca Premium de Monclova',
    description: 'Vive noches únicas con los mejores DJs y ambiente premium. La experiencia nocturna más exclusiva de Monclova, Coahuila.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Obsidian Social Club - Discoteca Premium en Monclova',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Obsidian Social Club | Monclova',
    description: 'La discoteca más exclusiva de Monclova. Reserva tu mesa y vive una experiencia única.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'tu-codigo-de-verificacion', // Agregar después de verificar en Google Search Console
  },
  category: 'entertainment',
}

// Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NightClub',
  name: 'Obsidian Social Club',
  description: 'La discoteca más exclusiva de Monclova, Coahuila. Música electrónica, DJs internacionales y ambiente premium.',
  url: 'https://www.obsidianmva.com',
  telephone: '+52-866-XXX-XXXX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Blvd Harold R. Pape 600',
    addressLocality: 'Monclova',
    addressRegion: 'Coahuila',
    postalCode: '25750',
    addressCountry: 'MX'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 26.9074,
    longitude: -101.4225
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Thursday', 'Friday', 'Saturday'],
      opens: '22:00',
      closes: '02:00'
    }
  ],
  priceRange: '$$$',
  servesCuisine: 'Drinks & Cocktails',
  sameAs: [
    'https://www.instagram.com/obsidianmva/',
    'https://www.facebook.com/profile.php?id=61581587972708'
  ],
  image: 'https://www.obsidianmva.com/og-image.jpg',
  currenciesAccepted: 'MXN',
  paymentAccepted: 'Cash, Credit Card'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${greatVibes.variable} ${raleway.variable} ${barlow.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}

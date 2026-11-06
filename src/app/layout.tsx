import type { Metadata, Viewport } from 'next'
import {
  Big_Shoulders,
  Instrument_Sans,
  JetBrains_Mono,
} from 'next/font/google'

import './globals.css'

const display = Big_Shoulders({
  weight: ['600', '800', '900'],
  subsets: ['latin'],
  variable: '--font-big-shoulders',
})
const body = Instrument_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-instrument',
})
const mono = JetBrains_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Halcyon H9',
  description:
    'Halcyon H9: a placa de vídeo que se desmonta camada por camada até o chip.',
}

export const viewport: Viewport = {
  themeColor: '#090b10',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}

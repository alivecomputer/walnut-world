import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Walnut — Build Your World",
  description: "The first alive computer. Your context. Your machine. Your world.",
  openGraph: {
    title: "Walnut — Build Your World",
    description: "The first alive computer. Your context. Your machine. Your world.",
    url: "https://walnut.world",
    siteName: "Walnut",
    type: "website",
    videos: [
      {
        url: "https://walnut.world/og-video.mp4",
        width: 1924,
        height: 1076,
        type: "video/mp4",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Walnut — Build Your World",
    description: "The first alive computer. Your context. Your machine. Your world.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}

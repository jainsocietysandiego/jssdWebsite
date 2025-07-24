import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 

export const metadata: Metadata = {
  title: 'Jain Society of San Diego Website',
  description: 'A 501(c)(3) non-profit religious organization dedicated to practicing, promoting, and preserving the Jain religion in the San Diego community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
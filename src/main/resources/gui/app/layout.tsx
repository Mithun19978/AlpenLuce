import './globals.css'

export const metadata = {
  title: 'AlpenLuce',
  description: 'Custom clothing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

import './globals.css';
import CurrencyDetector from '@/components/CurrencyDetector';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'AlpenLuce',
  description: 'Custom clothing platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CurrencyDetector />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

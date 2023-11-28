import './globals.css';
import { Inter } from 'next/font/google';
import SiteLayout from "./components/SiteLayout";
import Web3Provider from "./components/Web3Provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SuperToken Wizard',
  description: 'SuperToken Wizard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <SiteLayout>
            {children}
          </SiteLayout>
        </Web3Provider>
      </body>
    </html>
  );
}

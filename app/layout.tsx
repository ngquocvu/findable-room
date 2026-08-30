import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'RoomFindable',
  description: 'An 8-bit 3D room storage reminder application.',
  openGraph: {
    title: 'RoomFindable',
    description: 'An 8-bit 3D room storage reminder application.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoomFindable',
    description: 'An 8-bit 3D room storage reminder application.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

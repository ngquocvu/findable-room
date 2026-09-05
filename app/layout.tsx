import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'RoomFindable - 3D Room Storage & Inventory Finder',
  description: 'Visually design your room in 3D, remember where every single item is stored, and find anything in seconds with QR stickers.',
  openGraph: {
    title: 'RoomFindable',
    description: 'Smart 3D Room Storage & Inventory Finder.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoomFindable',
    description: 'Smart 3D Room Storage & Inventory Finder.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning className="antialiased">{children}</body>
    </html>
  );
}

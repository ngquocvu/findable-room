import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai.nguyenquocvu.com';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8a9a5b' },
    { media: '(prefers-color-scheme: dark)', color: '#4a4a38' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RoomFindable - Quản Lý & Tìm Kiếm Đồ Đạc Phòng 3D Thông Minh',
    template: '%s | RoomFindable',
  },
  description:
    'Thiết kế sơ đồ phòng 3D trực quan, ghi nhớ chính xác vị trí từng món đồ trong từng ngăn tủ, in nhãn QR code dán hộp và tìm lại mọi thứ trong tích tắc với trợ lý AI.',
  applicationName: 'RoomFindable',
  authors: [{ name: 'Nguyen Quoc Vu', url: siteUrl }],
  creator: 'Nguyen Quoc Vu',
  publisher: 'RoomFindable',
  keywords: [
    'RoomFindable',
    'quản lý đồ đạc',
    'sơ đồ phòng 3D',
    'tìm kiếm đồ trong nhà',
    'in nhãn QR dán tủ',
    'định vị đồ đạc',
    'dọn dẹp nhà cửa thông minh',
    '3d room storage',
    'inventory finder',
    'qr code storage labels',
    'room planner 3d',
    'smart home organizer',
    'gemini ai room locator',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': '/?lang=vi',
      'en-US': '/?lang=en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
    url: '/',
    siteName: 'RoomFindable',
    title: 'RoomFindable - Quản Lý & Tìm Kiếm Đồ Đạc Phòng 3D Thông Minh',
    description:
      'Thiết kế phòng 3D trực quan, lưu trữ vị trí đồ đạc theo từng ngăn tủ, in nhãn QR code thông minh và tìm đồ tức thì với AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoomFindable - 3D Room Storage & Inventory Finder',
    description:
      'Không bao giờ quên nơi cất giữ đồ đạc với sơ đồ phòng 3D và nhãn QR code thông minh.',
    creator: '@roomfindable',
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
  },
  manifest: '/site.webmanifest',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'RoomFindable',
  alternateName: 'RoomFindable - 3D Room Storage & Inventory Finder',
  url: siteUrl,
  applicationCategory: 'UtilitiesApplication, LifestyleApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires WebGL and modern web browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'VND',
  },
  author: {
    '@type': 'Person',
    name: 'Nguyen Quoc Vu',
    url: 'https://nguyenquocvu.com',
  },
  featureList: [
    '3D Interactive Spatial Room Builder',
    'Item & Furniture Multi-tier Hierarchical Storage',
    'Printable QR Code Container & Box Labels',
    'Semantic AI Natural Language Item Search',
    'On-Device Local Privacy First Architecture',
    'Bilingual Vietnamese and English Localization',
  ],
  description:
    'Ứng dụng quản lý và tìm kiếm vị trí đồ đạc trong phòng dạng mô hình 3D trực quan với nhãn dán QR và trợ lý AI thông minh.',
};

const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}

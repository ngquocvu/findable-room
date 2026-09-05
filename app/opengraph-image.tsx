import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'RoomFindable - 3D Room Storage & Inventory Finder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f7f2',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #f4f0e6 100%)',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Subtle decorative border */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '2px solid #e5e0d4',
            borderRadius: '24px',
            display: 'flex',
          }}
        />

        {/* Brand Tag Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#8a9a5b',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: '9999px',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '28px',
            boxShadow: '0 4px 12px rgba(138, 154, 91, 0.25)',
          }}
        >
          ✨ 3D Spatial Room & Inventory Finder
        </div>

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '68px',
              fontWeight: 800,
              color: '#383829',
              letterSpacing: '-0.02em',
            }}
          >
            Room<span style={{ color: '#6f7e45' }}>Findable</span>
          </div>
          <div
            style={{
              backgroundColor: '#6f7e45',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '24px',
              fontWeight: 800,
            }}
          >
            3D
          </div>
        </div>

        {/* Subtitle / Value Proposition */}
        <div
          style={{
            fontSize: '28px',
            color: '#5c584a',
            textAlign: 'center',
            maxWidth: '960px',
            lineHeight: 1.4,
            marginBottom: '36px',
          }}
        >
          Thiết kế phòng 3D trực quan, định vị chính xác vị trí mọi món đồ trong từng ngăn tủ với nhãn dán QR thông minh & Trợ lý AI
        </div>

        {/* Feature Highlights Row */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #dcd5c7',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#4a4a38',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            📦 3D Interactive Room
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #dcd5c7',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#4a4a38',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            🏷️ In Nhãn QR Dán Tủ
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #dcd5c7',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#4a4a38',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            🤖 AI Semantic Search
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #dcd5c7',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#4a4a38',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            🔒 Riêng tư trên thiết bị
          </div>
        </div>

        {/* Footer domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            fontWeight: 600,
            color: '#8a8576',
            letterSpacing: '0.02em',
          }}
        >
          ai.nguyenquocvu.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

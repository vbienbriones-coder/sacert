import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const QrCodeBadge: React.FC<QrCodeProps> = ({
  value,
  size = 120,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) console.error('QR code generation error:', error);
      }
    );
  }, [value, size, darkColor, lightColor]);

  return (
    <div className={`inline-flex flex-col items-center justify-center p-1.5 bg-white rounded border border-slate-200 shadow-sm ${className}`}>
      <canvas ref={canvasRef} width={size} height={size} className="block" />
    </div>
  );
};

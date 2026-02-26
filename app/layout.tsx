import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles.css';

export const metadata: Metadata = {
  title: 'IT 简历生成器',
  description: 'IT 简历生成器',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

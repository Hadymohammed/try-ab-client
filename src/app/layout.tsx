// src/app/layout.tsx
import './globals.css';
import PostHogPageView from './PostHogPageView';
import { CSPostHogProvider } from './provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <PostHogPageView /> 
        <body>{children}</body>
      </CSPostHogProvider>
    </html>
  );
}

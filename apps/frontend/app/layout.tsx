import './global.css';

export const metadata = {
  title: 'Realtime Currency Exchange',
  description:
    'A fast and efficient platform for tracking and converting currencies in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

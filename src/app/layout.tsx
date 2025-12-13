// Root layout required when using root not-found.tsx
// This is minimal since the actual layout is in [locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

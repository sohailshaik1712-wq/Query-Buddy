import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-slate-950">
      <body className="h-full m-0 p-0 overflow-hidden flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

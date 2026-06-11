import "./globals.css";

export const metadata = {
  title: "IOPn Dex",
    description: "DEX Analytics & Trading Platform",
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
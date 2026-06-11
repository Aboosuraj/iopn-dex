import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
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
                    <body>
                        <Providers>
                            <Navbar />
                                    {children}
                                    </Providers>
                                          </body>
                                              </html>
                                                );
                                                }
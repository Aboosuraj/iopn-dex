import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "IOPn Dex Analytics",
    description: "DEX Analytics Platform on IOPn Chain",
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
                                                <main>{children}</main>
                                                                  </Providers>
                                                                        </body>
                                                                            </html>
                                                                              );
                                                                              }
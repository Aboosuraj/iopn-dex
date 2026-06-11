import Link from "next/link";

export default function Navbar() {
  return (
      <nav className="flex gap-4 p-4 border-b">
            <Link href="/">Home</Link>
                  <Link href="/markets">Markets</Link>
                        <Link href="/analytics">Analytics</Link>
                              <Link href="/trade">Trade</Link>
                                    <Link href="/portfolio">Portfolio</Link>
                                          <Link href="/watchlist">Watchlist</Link>
                                                <Link href="/wallet">Wallet</Link>
                                                    </nav>
                                                      );
                                                      }
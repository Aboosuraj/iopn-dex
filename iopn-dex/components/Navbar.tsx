import Link from "next/link";
import WalletButton from "./WalletButton";

export default function Navbar() {
  return (
      <nav className="flex items-center justify-between p-4 border-b">
            <div className="flex gap-4">
                    <Link href="/">Home</Link>
                            <Link href="/markets">Markets</Link>
                                    <Link href="/analytics">Analytics</Link>
                                            <Link href="/trade">Trade</Link>
                                                    <Link href="/portfolio">Portfolio</Link>
                                                            <Link href="/watchlist">Watchlist</Link>
                                                                    <Link href="/wallet">Wallet</Link>
                                                                          </div>

                                                                                <WalletButton />
                                                                                    </nav>
                                                                                      );
                                                                                      }
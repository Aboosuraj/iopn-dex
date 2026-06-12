import Link from "next/link";
import WalletButton from "./WalletButton";
import Logo from "./Logo";

export default function Navbar() {
  return (
      <nav className="flex items-center justify-between px-6 py-4 border-b bg-black/20">
        
            <div className="flex gap-5">
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
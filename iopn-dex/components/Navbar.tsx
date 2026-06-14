import Link from "next/link";
import WalletButton from "./WalletButton";

export default function Navbar() {
  return (
      <nav className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold">
                              IOPn Dex
                                      </Link>

                                              <div className="flex items-center gap-4">
                                                        <Link href="/">Home</Link>

                                                                  <Link href="/markets">
                                                                              Markets
                                                                                        </Link>

                                                                                                  <Link href="/trade">
                                                                                                              Trade
                                                                                                                        </Link>

                                                                                                                                  <Link href="/analytics">
                                                                                                                                              Analytics
                                                                                                                                                        </Link>

                                                                                                                                                                  <Link href="/tokens">
                                                                                                                                                                              Tokens
                                                                                                                                                                                    </Link>

                                                                                                                                                                                                  <Link href="/pairs">
                                                                                                                                                                                                              Pairs
                                                                                                                                                                                                                        </Link>

                                                                                                                                                                                                                                  <Link href="/portfolio">
                                                                                                                                                                                                                                              Portfolio
                                                                                                                                                                                                                                                        </Link>

                                                                                                                                                                                                                                                                  <Link href="/watchlist">
                                                                                                                                                                                                                                                                              Watchlist
                                                                                                                                                                                                                                                                                        </Link>

                                                                                                                                                                                                                                                                                                  <Link href="/wallet">
                                                                                                                                                                                                                                                                                                              Wallet
                                                                                                                                                                                                                                                                                                                        </Link>

                                                                                                                                                                                                                                                                                                                                  <Link href="/explorer">
                                                                                                                                                                                                                                                                                                                                              Explorer
                                                                                                                                                                                                                                                                                                                                                        </Link>
                                                                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                                                                        <WalletButton />
                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                  </nav>
                                                                                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                                                                                    }
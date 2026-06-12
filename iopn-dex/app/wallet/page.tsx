import WalletStatus from "@/components/WalletStatus";

export default function WalletPage() {
  return (
      <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                    Wallet
                          </h1>

                                <WalletStatus />

                                      <div className="mt-4 border rounded-xl p-5 shadow-sm">
                                              Connect your wallet to see:
                                                      <ul className="mt-4">
                                                                <li>• Wallet Address</li>
                                                                          <li>• OPN Balance</li>
                                                                                    <li>• Token Holdings</li>
                                                                                              <li>• Portfolio Value</li>
                                                                                                      </ul>
                                                                                                            </div>
                                                                                                                </div>
                                                                                                                  );
                                                                                                                  }
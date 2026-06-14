import WalletStatus from "@/components/WalletStatus";

export default function WalletPage() {
  return (
      <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                    Wallet
                          </h1>

                                <WalletStatus />
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                      <div className="border rounded-xl p-5">
                                          <h3 className="font-bold">OPN Balance</h3>
                                              <p>0.00 OPN</p>
                                                </div>

                                                  <div className="border rounded-xl p-5">
                                                      <h3 className="font-bold">Portfolio Value</h3>
                                                          <p>$0.00</p>
                                                            </div>
                                                            </div>

                                      <div className="mt-4 border rounded-xl p-5 shadow-sm">
                                              Connect your wallet to see:
                                                      <ul className="mt-4">
                                                                <li>• Wallet Address</li>
                                                                          <li>• OPN Balance</li>
                                                                                    <li>• Token Holdings</li>
                                                                                              <li>• Portfolio Value</li>
                                                                                                      </ul>
                                                                                                      </div>
                                                                                                      <div className="mt-6 border rounded-xl p-5">
                                                                                                          <h2 className="text-xl font-bold mb-4">
                                                                                                              Recent Transactions
                                                                                                                </h2>

                                                                                                                  <p>No transactions found.</p>
                                                                                                                  
                                                                                                            </div>
                                                                                                                </div>
                                                                                                                  );
                                                                                                                  }
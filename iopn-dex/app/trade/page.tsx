export default function TradePage() {
        return (
            <div className="p-6 max-w-md mx-auto">
                  <h1 className="text-3xl font-bold mb-6">
                          Trade
                                </h1>

                                      <div className="border rounded-xl p-5">
                                              <div className="mb-4">
                                                        <label>From</label>
                                                                  <input
                                                                              className="w-full border rounded p-2 mt-1"
                                                                                          placeholder="0.0"
                                                                                                    />
                                                                                                            </div>

                                                                                                                    <div className="mb-4">
                                                                                                                              <label>To</label>
                                                                                                                                        <input
                                                                                                                                                    className="w-full border rounded p-2 mt-1"
                                                                                                                                                                placeholder="0.0"
                                                                                                                                                                          />
                                                                                                                                                                                  </div>

                                                                                                                                                                                          <button className="w-full border rounded-lg p-3">
                                                                                                                                                                                                    Swap
                                                                                                                                                                                                            </button>
                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                        );
                                                                                                                                                                                                                        }
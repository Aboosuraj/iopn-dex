export default function WatchlistPanel() {
      const watchlist = ["OPN", "DIO"];

        return (
            <div className="p-6">
                  <h1 className="text-3xl font-bold mb-6">
                          Watchlist
                                </h1>

                                      {watchlist.map((token) => (
                                              <div
                                                        key={token}
                                                                  className="border rounded-lg p-4 mb-3"
                                                                          >
                                                                                    {token}
                                                                                            </div>
                                                                                                  ))}
                                                                                                      </div>
                                                                                                        );
                                                                                                        }
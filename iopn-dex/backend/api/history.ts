import Transaction from "../db/Transaction";

export async function getHistory(address: string) {
  try {
    const txs = await Transaction.find({
      $or: [{ from: address }, { to: address }],
    }).sort({ createdAt: -1 });

    return {
      success: true,
      data: txs,
    };
  } catch (err) {
    return {
      success: false,
      error: "Failed to fetch history",
    };
  }
}
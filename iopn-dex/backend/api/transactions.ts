import { connectDB } from "../services/db";
import Transaction from "../db/Transaction";

export async function getTransactions(req: any, res: any) {
  await connectDB();

  const txs = await Transaction.find().sort({ timestamp: -1 });

  res.json(txs);
}
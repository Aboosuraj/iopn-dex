import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    hash: String,
    from: String,
    to: String,
    amount: String,
    token: String,
    status: String,
    chainId: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", TransactionSchema);
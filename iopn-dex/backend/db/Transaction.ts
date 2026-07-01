import mongoose from "mongoose";

const TxSchema = new mongoose.Schema({
  hash: String,
  from: String,
  to: String,
  amount: String,
  token: String,
  status: String,
  chainId: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", TxSchema);
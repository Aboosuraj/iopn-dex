import express from "express";
import Transaction from "../db/Transaction";

const router = express.Router();

router.post("/save-tx", async (req, res) => {
  try {
      const tx = await Transaction.create(req.body);
          res.json({ success: true, tx });
            } catch (err) {
                res.status(500).json({ success: false, error: err });
                  }
                  });

                  export default router;
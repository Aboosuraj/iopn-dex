import mongoose, { Schema, models, model } from "mongoose";

const TransactionSchema = new Schema(
  {
      hash: {
            type: String,
                  required: true,
                        unique: true,
                              index: true,
                                  },

                                      from: {
                                            type: String,
                                                  required: true,
                                                        index: true,
                                                            },

                                                                to: {
                                                                      type: String,
                                                                            required: true,
                                                                                  index: true,
                                                                                      },

                                                                                          amount: {
                                                                                                type: String,
                                                                                                      required: true,
                                                                                                          },

                                                                                                              token: {
                                                                                                                    type: String,
                                                                                                                          required: true,
                                                                                                                                default: "OPN",
                                                                                                                                    },

                                                                                                                                        chainId: {
                                                                                                                                              type: Number,
                                                                                                                                                    required: true,
                                                                                                                                                          default: 984,
                                                                                                                                                              },

                                                                                                                                                                  status: {
                                                                                                                                                                        type: String,
                                                                                                                                                                              enum: ["pending", "confirmed", "failed"],
                                                                                                                                                                                    default: "pending",
                                                                                                                                                                                        },

                                                                                                                                                                                            blockNumber: {
                                                                                                                                                                                                  type: Number,
                                                                                                                                                                                                        default: null,
                                                                                                                                                                                                            },

                                                                                                                                                                                                                gasUsed: {
                                                                                                                                                                                                                      type: String,
                                                                                                                                                                                                                            default: "",
                                                                                                                                                                                                                                },

                                                                                                                                                                                                                                    explorerUrl: {
                                                                                                                                                                                                                                          type: String,
                                                                                                                                                                                                                                                default: "",
                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                      },
                                                                                                                                                                                                                                                        {
                                                                                                                                                                                                                                                            timestamps: true, // Automatically creates createdAt and updatedAt
                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                              );

                                                                                                                                                                                                                                                              const Transaction =
                                                                                                                                                                                                                                                                models.Transaction || model("Transaction", TransactionSchema);

                                                                                                                                                                                                                                                                export default Transaction;
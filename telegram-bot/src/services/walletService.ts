import { Wallet } from "ethers";
import WalletModel from "../models/Wallet";


export async function createWallet(
  telegramId: string
) {

  const existing =
    await WalletModel.findOne({
      telegramId,
    });


  if (existing) {
    return existing;
  }


  const wallet =
    Wallet.createRandom();


  const saved =
    await WalletModel.create({

      telegramId,

      address:
        wallet.address,

      privateKey:
        wallet.privateKey,

    });


  return saved;
}
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

import { mainMenu } from "./keyboards/mainMenu";
import { walletMenu } from "./keyboards/walletMenu";

import { createWallet } from "./services/walletService";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);


// =========================
// START
// =========================

bot.start(async (ctx) => {

  await ctx.reply(
`🚀 *IOPn Trading Bot*

💼 *Wallet*
Not Connected

💰 *Balance*
0.00 OPN

🌐 *Network*
OPN Chain

━━━━━━━━━━━━━━━━━━

Choose an option:`,
{
  parse_mode: "Markdown",
  ...mainMenu,
});

});



// =========================
// HOME
// =========================

bot.action("home", async (ctx)=>{

 await ctx.answerCbQuery();

 await ctx.editMessageText(
`🚀 *IOPn Trading Bot*

💼 *Wallet*
Not Connected

💰 *Balance*
0.00 OPN

🌐 *Network*
OPN Chain

━━━━━━━━━━━━━━━━━━

Choose an option:`,
{
 parse_mode:"Markdown",
 ...mainMenu,
});

});



// =========================
// WALLET MENU
// =========================

bot.action("wallet", async(ctx)=>{

 await ctx.answerCbQuery();


 await ctx.editMessageText(
`💼 *Wallet Manager*

Status:
❌ Not Connected

━━━━━━━━━━━━━━━━━━

Choose an option:`,
{
 parse_mode:"Markdown",
 ...walletMenu,
});

});



// =========================
// CREATE WALLET
// =========================

bot.action("create_wallet", async(ctx)=>{


 await ctx.answerCbQuery();


 try {


 const telegramId =
 ctx.from.id.toString();



 const wallet =
 await createWallet(
 telegramId
 );



 await ctx.editMessageText(
`✅ *Wallet Created*

━━━━━━━━━━━━━━━━━━

💼 Address:

\`${wallet.address}\`

━━━━━━━━━━━━━━━━━━

⚠️ Save your wallet securely.

Your private key is never shown here.

`,
{
 parse_mode:"Markdown",
 ...walletMenu,
 });


 } catch(error){


 console.error(
 "Create wallet error:",
 error
 );


 await ctx.reply(
 "❌ Failed to create wallet"
 );


 }


});



// =========================
// OTHER WALLET BUTTONS
// =========================

bot.action("import_wallet", async(ctx)=>{

 await ctx.answerCbQuery(
 "Import wallet coming next 🚀"
 );

});


bot.action("export_wallet", async(ctx)=>{

 await ctx.answerCbQuery(
 "Export wallet coming next 🚀"
 );

});


bot.action("delete_wallet", async(ctx)=>{

 await ctx.answerCbQuery(
 "Delete wallet coming next 🚀"
 );

});



// =========================
// OTHER BUTTONS
// =========================

const comingSoon = async(ctx:any)=>{

 await ctx.answerCbQuery(
 "Feature coming soon 🚀"
 );

};


[
"buy",
"sell",
"portfolio",
"positions",
"watchlist",
"orders",
"copytrade",
"sniper",
"alerts",
"settings",
"referral",
"help"

].forEach(action=>{

 bot.action(
 action,
 comingSoon
 );

});



export default bot;
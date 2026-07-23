import bot from "./bot";
import { connectDatabase } from "./config/database";


async function start(){

  await connectDatabase();

  bot.launch();

  console.log(
    "🚀 IOPn Trading Bot running"
  );

}


start();


process.once(
  "SIGINT",
  () => bot.stop("SIGINT")
);


process.once(
  "SIGTERM",
  () => bot.stop("SIGTERM")
);
import { Markup } from "telegraf";

export const mainMenu = Markup.inlineKeyboard([
  [
    Markup.button.callback("💼 Wallet", "wallet"),
    Markup.button.callback("💰 Buy", "buy"),
  ],
  [
    Markup.button.callback("💸 Sell", "sell"),
    Markup.button.callback("📊 Portfolio", "portfolio"),
  ],
  [
    Markup.button.callback("📈 Positions", "positions"),
    Markup.button.callback("⭐ Watchlist", "watchlist"),
  ],
  [
    Markup.button.callback("📋 Orders", "orders"),
    Markup.button.callback("🤖 Copy Trade", "copytrade"),
  ],
  [
    Markup.button.callback("🎯 Sniper", "sniper"),
    Markup.button.callback("🔔 Alerts", "alerts"),
  ],
  [
    Markup.button.callback("⚙️ Settings", "settings"),
    Markup.button.callback("👥 Referral", "referral"),
  ],
  [
    Markup.button.callback("❓ Help", "help"),
  ],
]);
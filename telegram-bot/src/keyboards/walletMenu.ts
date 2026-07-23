import { Markup } from "telegraf";

export const walletMenu = Markup.inlineKeyboard([
  [
    Markup.button.callback("🔑 Create Wallet", "create_wallet"),
    Markup.button.callback("📥 Import Wallet", "import_wallet"),
  ],
  [
    Markup.button.callback("📤 Export Wallet", "export_wallet"),
    Markup.button.callback("🗑 Delete Wallet", "delete_wallet"),
  ],
  [
    Markup.button.callback("🔙 Back", "home"),
  ],
]);
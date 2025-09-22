import WAWebJS from "whatsapp-web.js";

export const helpCommand = async (chat: WAWebJS.Chat, commands: string[]) => {
  let text = "Comandos válidos: ";
  for (const command of commands) {
    text += "\n- " + command;
  }
  await chat.sendMessage(text);
};

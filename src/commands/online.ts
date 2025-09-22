import { execSync } from "child_process";
import WAWebJS from "whatsapp-web.js";

export const onlineCommand = async (chat: WAWebJS.Chat, count: number) => {
  const stdout = execSync("uptime");
  const status = String(stdout);

  const result = status.replace(/\s+/g, " ").split(" ", 6);

  if (result[4] == "days," || result[4] == "day,") {
    const hours = result[5].split(":");
    chat.sendMessage(
      `🤖 100% online chefe 🤖\n\nComandos realizados com sucesso:\n> ${count}\n\nTempo ativo:\n> ${
        result[3]
      } dias, ${hours[0]} horas e ${hours[1].split(",")[0]} minutos`
    );
  } else if (result[4] == "min,") {
    chat.sendMessage(
      `🤖 100% online chefe 🤖\n\nComandos realizados com sucesso:\n> ${count}\n\nTempo ativo:\n> ${result[3]} minutos`
    );
  } else {
    const hours = result[3].split(":");
    chat.sendMessage(
      `🤖 100% online chefe 🤖\n\nComandos realizados com sucesso:\n> ${count}\n\nTempo ativo:\n> ${
        hours[0]
      } horas e ${hours[1].split(",")[0]} minutos`
    );
  }
};

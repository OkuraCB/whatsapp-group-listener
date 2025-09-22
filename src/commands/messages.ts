import WAWebJS from "whatsapp-web.js";

export const pyCommand = async (chat: WAWebJS.Chat) => {
  await chat.sendMessage(
    "https://github.com/1sa4c/pyzzachat\nAcesse já utilizando o arquivo `main.py` dentro de `client` no IP arthurtv.duckdns.org e porta 9000!"
  );
};

export const srcCommand = async (chat: WAWebJS.Chat) => {
  await chat.sendMessage("https://github.com/OkuraCB/whatsapp-group-listener");
};

export const minecraftCommand = async (chat: WAWebJS.Chat) => {
  await chat.sendMessage(
    "Então você quer entrar no servidor do Xurso de Minecraft? Aqui vão as informações:\n- Minecraft 1.21.6;\n- IP: `arthurtv.duckdns.org`;\n- Porta (para Minecraft Java): `25565`"
  );
};

import { PrismaClient } from "@prisma/client";
import qrcode from "qrcode-terminal";
import { Client, GroupChat, LocalAuth, MessageTypes } from "whatsapp-web.js";

const prisma = new PrismaClient();

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "authData" }),
});

client.initialize();

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("auth_failure", () => console.log("AUTHENTICATION FAILED"));

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("ready", async () => {
  console.log("READY");
  const debugWWebVersion = await client.getWWebVersion();
  console.log(`WWebVersion = ${debugWWebVersion}`);
});

client.on("message_create", async (msg) => {
  const chat = await msg.getChat();
  if (msg.body === "!everyone" && chat.isGroup) {
    const people = (chat as GroupChat).participants;

    let text = "";
    let mentions: string[] = [];

    for (const person of people) {
      mentions.push(`${person.id.user}@c.us`);
      text += `@${person.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
  }
  if (chat.isGroup && (chat as GroupChat).name === "Xepa") {
    const author = await msg.getContact();

    if (msg.type === MessageTypes.STICKER) {
      const sticker = await msg.downloadMedia();
      console.log(sticker.mimetype + sticker.filename);
    }

    await prisma.message.create({
      data: {
        authorNumber: author.number ?? "",
        authorName: author.isMe ? "Arthur" : author.pushname,
        deviceType: msg.deviceType ?? "",
        type: msg.type ?? "",
        body: msg.type === MessageTypes.TEXT ? msg.body : msg.type,
        hasMedia: msg.hasMedia,
        hasQuoteMsg: msg.hasQuotedMsg,
      },
    });
  }
});

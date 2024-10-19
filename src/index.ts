import { PrismaClient } from "@prisma/client";
import fs from "fs";
import qrcode from "qrcode-terminal";
import { Client, GroupChat, LocalAuth, MessageTypes } from "whatsapp-web.js";

let flag = 1;
const commands = ["!everyone", "!online"];

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

  if (commands.includes(msg.body)) {
    flag = 1;
    switch (msg.body) {
      case "!everyone":
        if (chat.isGroup) {
          const people = (chat as GroupChat).participants;

          let text = "";
          let mentions: string[] = [];

          for (const person of people) {
            mentions.push(`${person.id.user}@c.us`);
            text += `@${person.id.user} `;
          }

          await chat.sendMessage(text, { mentions });
        }
        break;

      case "!online":
        await chat.sendMessage("100% online chefe");
        break;

      default:
        break;
    }
  } else {
    if (chat.isGroup && (chat as GroupChat).name === "Xepa") {
      const author = await msg.getContact();

      switch (msg.type) {
        case MessageTypes.TEXT:
          if (flag === 1 && author.isMe) flag = 0;
          else
            await prisma.message.create({
              data: {
                authorNumber: author.number ?? "",
                authorName: author.isMe ? "Arthur" : author.pushname,
                deviceType: msg.deviceType ?? "",
                body: msg.body,
                hasMedia: msg.hasMedia,
                hasQuoteMsg: msg.hasQuotedMsg,
              },
            });
          break;

        case MessageTypes.STICKER:
          if (!fs.existsSync("stickers")) fs.mkdirSync("stickers");

          const sticker = await msg.downloadMedia();
          const data = sticker.data.replace(/^data:image\/\w+;base64,/, "");

          const buffer = Buffer.from(data, "base64");
          const foundSticker = fs.existsSync(
            "stickers/" + msg.mediaKey + ".png"
          );

          if (!foundSticker)
            fs.writeFileSync("stickers/" + msg.mediaKey + ".png", buffer);

          await prisma.sticker.create({
            data: {
              authorNumber: author.number ?? "",
              authorName: author.isMe ? "Arthur" : author.pushname,
              deviceType: msg.deviceType ?? "",
              mediaKey: msg.mediaKey ?? "",
              stickerSize: String(sticker.filesize) ?? "",
              hasQuoteMsg: msg.hasQuotedMsg,
            },
          });
          break;

        default:
          break;
      }
    }
  }
});

import { PrismaClient } from "@prisma/client";
import { flatten } from "flat";
import fs from "fs";
import qrcode from "qrcode-terminal";
import { Client, GroupChat, LocalAuth, MessageTypes } from "whatsapp-web.js";

interface pollOption {
  name: string;
  localId: number;
}

let flag = 1;
const commands = ["!everyone", "!online", "!py", "!src", "!help", "!minecraft"];

const prisma = new PrismaClient();

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "authData" }),
  puppeteer: { args: ["--no-sandbox"] },
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
        await chat.sendMessage("🤖 100% online chefe 🤖");
        break;

      case "!py":
        await chat.sendMessage(
          "https://github.com/1sa4c/pyzzachat\nAcesse já utilizando o arquivo `main.py` dentro de `client` no IP arthurtv.duckdns.org e porta 10004!"
        );
        break;

      case "!minecraft":
        await chat.sendMessage(
          "Então você quer entrar no servidor do Xurso de Minecraft? Aqui vão as informações:\n- Minecraft 1.21.4;\n- IP: `arthurtv.duckdns.org`;\n- Porta (para Minecraft Java): `25565`;\n- Porta (para Minecraft Bedrock): `19132`"
        );
        break;

      case "!src":
        await chat.sendMessage(
          "https://github.com/OkuraCB/whatsapp-group-listener"
        );
        break;

      case "!help":
        let text = "Comandos válidos: ";
        for (const command of commands) {
          text += "\n- " + command;
        }
        await chat.sendMessage(text);
        break;

      default:
        if (/^!everyone.+$/.test(msg.body) && chat.isGroup) {
          const people = (chat as GroupChat).participants;

          let text = "";
          let mentions: string[] = [];

          for (const person of people) {
            mentions.push(`${person.id.user}@c.us`);
            text += `@${person.id.user} `;
          }

          await chat.sendMessage(text, {
            mentions,
            quotedMessageId: msg.id.id,
          });
        }

        break;
    }
  } else {
    if (chat.isGroup && (chat as GroupChat).id.user === process.env.GROUP_ID) {
      const author = await msg.getContact();

      if (msg.hasQuotedMsg) {
        const quote = await msg.getQuotedMessage();
        await prisma.quotes.create({
          data: { messageQuotted: quote.id.id, messageQuotting: msg.id.id },
        });
      }

      switch (msg.type) {
        case MessageTypes.TEXT:
          if (flag === 1 && author.isMe) flag = 0;
          else
            await prisma.text.create({
              data: {
                id: msg.id.id,
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
            fs.writeFileSync(
              "stickers/" + msg.mediaKey?.replace(/[/]/g, ".") + ".png",
              buffer
            );

          await prisma.sticker.create({
            data: {
              id: msg.id.id,
              authorNumber: author.number ?? "",
              authorName: author.isMe ? "Arthur" : author.pushname,
              deviceType: msg.deviceType ?? "",
              mediaKey: msg.mediaKey?.replace(/[/]/g, ".") ?? "",
              stickerSize: sticker.filesize ?? 0,
              hasQuoteMsg: msg.hasQuotedMsg,
            },
          });
          break;

        case MessageTypes.AUDIO:
          await prisma.audio.create({
            data: {
              id: msg.id.id,
              authorNumber: author.number ?? "",
              authorName: author.isMe ? "Arthur" : author.pushname,
              deviceType: msg.deviceType ?? "",
              duration: msg.duration,
              hasQuoteMsg: msg.hasQuotedMsg,
            },
          });
          break;

        case MessageTypes.VOICE:
          if (!msg["_data"].isViewOnce) {
            await prisma.voice.create({
              data: {
                id: msg.id.id,
                authorNumber: author.number ?? "",
                authorName: author.isMe ? "Arthur" : author.pushname,
                deviceType: msg.deviceType ?? "",
                duration: msg.duration,
                hasQuoteMsg: msg.hasQuotedMsg,
                isViewOnce: false,
              },
            });
          } else {
            await prisma.voice.create({
              data: {
                id: msg.id.id,
                authorNumber: author.number ?? "",
                authorName: author.isMe ? "Arthur" : author.pushname,
                deviceType: msg.deviceType ?? "",
                duration: msg.duration,
                hasQuoteMsg: msg.hasQuotedMsg,
                isViewOnce: true,
              },
            });
          }
          break;

        case MessageTypes.POLL_CREATION:
          const poll = await prisma.poll.create({
            data: {
              id: msg.id.id,
              authorNumber: author.number ?? "",
              authorName: author.isMe ? "Arthur" : author.pushname,
              deviceType: msg.deviceType ?? "",
              pollName: msg.pollName,
              hasQuoteMsg: msg.hasQuotedMsg,
            },
          });

          const options = msg.pollOptions as unknown as pollOption[];

          for (const option of options) {
            await prisma.pollOption.create({
              data: {
                title: option.name,
                poll: { connect: { id: poll.id } },
              },
            });
          }
          break;

        case MessageTypes.IMAGE:
          if (!msg["_data"].isViewOnce) {
            const image = await msg.downloadMedia();
            await prisma.image.create({
              data: {
                id: msg.id.id,
                authorNumber: author.number ?? "",
                authorName: author.isMe ? "Arthur" : author.pushname,
                deviceType: msg.deviceType ?? "",
                size: image.filesize ?? 0,
                hasQuoteMsg: msg.hasQuotedMsg,
                isViewOnce: false,
              },
            });
          } else {
            await prisma.image.create({
              data: {
                id: msg.id.id,
                authorNumber: author.number ?? "",
                authorName: author.isMe ? "Arthur" : author.pushname,
                deviceType: msg.deviceType ?? "",
                size: 0,
                hasQuoteMsg: msg.hasQuotedMsg,
                isViewOnce: true,
              },
            });
          }
          break;

        case MessageTypes.VIDEO:
          if (!msg["_data"].isViewOnce) {
            const video = await msg.downloadMedia();
            await prisma.video.create({
              data: {
                id: msg.id.id,
                authorNumber: author.number ?? "",
                authorName: author.isMe ? "Arthur" : author.pushname,
                deviceType: msg.deviceType ?? "",
                duration: msg.duration ?? 0,
                size: video.filesize ?? 0,
                hasQuoteMsg: msg.hasQuotedMsg,
                isViewOnce: false,
              },
            });
          } else {
            await prisma.video.create({
              data: {
                id: msg.id.id,
                authorNumber: author.number ?? "",
                authorName: author.isMe ? "Arthur" : author.pushname,
                deviceType: msg.deviceType ?? "",
                duration: msg.duration ?? 0,
                size: 0,
                hasQuoteMsg: msg.hasQuotedMsg,
                isViewOnce: true,
              },
            });
          }
          break;

        case MessageTypes.DOCUMENT:
          const document = await msg.downloadMedia();
          await prisma.document.create({
            data: {
              id: msg.id.id,
              authorNumber: author.number ?? "",
              authorName: author.isMe ? "Arthur" : author.pushname,
              deviceType: msg.deviceType ?? "",
              size: document.filesize ?? 0,
              name: document.filename ?? "",
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

client.on("vote_update", async (vote) => {
  const voterNumber = vote.voter.split("@")[0];
  const selectedOptions = vote.selectedOptions;
  const voterFound = await prisma.pollVote.findFirst({
    where: { voterNumber: voterNumber, pollId: vote.parentMessage.id.id },
  });

  if (voterFound)
    await prisma.pollVote.deleteMany({
      where: {
        voterNumber: voterNumber,
        pollId: vote.parentMessage.id.id,
      },
    });

  for (const option of selectedOptions) {
    await prisma.pollVote.create({
      data: {
        voteTitle: option.name,
        voterNumber: voterNumber,
        poll: { connect: { id: vote.parentMessage.id.id } },
      },
    });
  }
});

client.on("message_revoke_everyone", async (msg, rvk_msg) => {
  const author = await msg.getContact();
  const rvk_id = (flatten(msg) as any)["_data.protocolMessageKey.id"];

  let type;

  const text = await prisma.text.findFirst({ where: { id: rvk_id } });
  if (text) {
    await prisma.text.delete({ where: { id: rvk_id } });
    type = "text";
  }

  const sticker = await prisma.sticker.findFirst({ where: { id: rvk_id } });
  if (sticker) {
    await prisma.sticker.delete({ where: { id: rvk_id } });
    type = "sticker";
  }

  const audio = await prisma.audio.findFirst({ where: { id: rvk_id } });
  if (audio) {
    await prisma.audio.delete({ where: { id: rvk_id } });
    type = "audio";
  }

  const voice = await prisma.voice.findFirst({ where: { id: rvk_id } });
  if (voice) {
    await prisma.voice.delete({ where: { id: rvk_id } });
    type = "voice";
  }

  const poll = await prisma.poll.findFirst({ where: { id: rvk_id } });
  if (poll) {
    await prisma.poll.delete({ where: { id: rvk_id } });
    type = "poll";
  }

  const image = await prisma.image.findFirst({ where: { id: rvk_id } });
  if (image) {
    await prisma.image.delete({ where: { id: rvk_id } });
    type = "image";
  }

  const video = await prisma.video.findFirst({ where: { id: rvk_id } });
  if (video) {
    await prisma.video.delete({ where: { id: rvk_id } });
    type = "video";
  }

  const document = await prisma.document.findFirst({ where: { id: rvk_id } });
  if (document) {
    await prisma.document.delete({ where: { id: rvk_id } });
    type = "document";
  }

  await prisma.revoked.create({
    data: {
      id: rvk_id,
      authorNumber: author.number ?? "",
      authorName: author.isMe ? "Arthur" : author.pushname,
      deviceType: msg.deviceType ?? "",
      type: type ?? "",
    },
  });
});

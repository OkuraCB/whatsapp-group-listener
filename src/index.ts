import { PrismaClient } from "@prisma/client";
import { flatten } from "flat";
import qrcode from "qrcode-terminal";
import { Client, GroupChat, LocalAuth, MessageTypes } from "whatsapp-web.js";
import {
  everyoneCommand,
  everyoneReply,
  everyoneTags,
} from "./commands/everyone";
import { helpCommand } from "./commands/help";
import { minecraftCommand, pyCommand, srcCommand } from "./commands/messages";
import { onlineCommand } from "./commands/online";
import { remindMeCommand, remindThisCommand } from "./commands/remind";
import { getTags, tagCommand } from "./commands/tag";
import { saveSticker } from "./utils/saveSticker";

interface pollOption {
  name: string;
  localId: number;
}

let flag = 1;
let commandCount = 1;
const commands = [
  "!everyone",
  "!online",
  "!py",
  "!src",
  "!help",
  "!minecraft",
  "!remindme <tempo> <minutos|horas|dias>",
  "!remindthis <tempo> <minutos|horas|dias>",
  "!mytags",
];

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

    if (msg.body == "!everyone") await everyoneCommand(chat as GroupChat);
    else if (msg.body == "!online") await onlineCommand(chat, commandCount);
    else if (msg.body == "!py") await pyCommand(chat);
    else if (msg.body == "!src") await srcCommand(chat);
    else if (msg.body == "!minecraft") await minecraftCommand(chat);
    else if (msg.body == "!help") await helpCommand(chat, commands);
    else if (msg.body == "!mytags") await getTags(chat, msg, prisma);

    commandCount++;
  } else if (/^!everyone\s.+/.test(msg.body) && chat.isGroup) {
    flag = 1;

    const splits = msg.body.split(" ").length;
    if (splits == 2) await everyoneTags(chat as GroupChat, msg, prisma);
    else await everyoneReply(chat as GroupChat, msg);

    commandCount++;
  } else if (/^!remindme\s.+/.test(msg.body)) {
    flag = 1;

    await remindMeCommand(msg);

    commandCount++;
  } else if (/^!remindthis\s.+/.test(msg.body)) {
    flag = 1;

    await remindThisCommand(msg);

    commandCount++;
  } else if (/^!tag\s.+\s.+/.test(msg.body)) {
    flag = 1;

    await tagCommand(chat, msg, prisma);

    commandCount++;
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
          const sticker = await saveSticker(msg);

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

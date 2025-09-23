import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import WAWebJS, { GroupChat } from "whatsapp-web.js";
import { extractTag } from "./tag";

export const everyoneCommand = async (chat: GroupChat) => {
  if (chat.isGroup) {
    const people = chat.participants;

    let text = "";
    let mentions: string[] = [];

    for (const person of people) {
      mentions.push(`${person.id.user}@c.us`);
      text += `@${person.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
  }
};

export const everyoneReply = async (
  chat: GroupChat,
  message: WAWebJS.Message
) => {
  const people = chat.participants;

  let text = "";
  let mentions: string[] = [];

  for (const person of people) {
    mentions.push(`${person.id.user}@c.us`);
    text += `@${person.id.user} `;
  }

  await message.reply(text, undefined, { mentions });
};

export const everyoneTags = async (
  chat: GroupChat,
  message: WAWebJS.Message,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
  try {
    const tag = extractTag(message);
    const tagged = (await prisma.tag.findMany({ where: { tag: tag } })).map(
      (value) => value.user
    );

    const members = chat.participants;
    const people = members.filter((value) => tagged.includes(value.id.user));

    let text = "";
    let mentions: string[] = [];

    for (const person of people) {
      mentions.push(`${person.id.user}@c.us`);
      text += `@${person.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
  } catch (e) {
    console.log(e);
    await chat.sendMessage("🤖Oops! Algo deu errado!🤖");
  }
};

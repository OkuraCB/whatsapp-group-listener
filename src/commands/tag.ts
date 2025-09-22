import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import WAWebJS from "whatsapp-web.js";

export const tagCommand = async (
  chat: WAWebJS.Chat,
  message: WAWebJS.Message,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
  try {
    if (!chat.isGroup) throw new Error();

    const author = await message.getContact();
    const contacts = await message.getMentions();

    if (!contacts) throw new Error();

    const tagParts = message.body.split(" ");
    let tag = "";

    for (let i = 1; i < tagParts.length; i++) {
      if (tagParts[i].startsWith("@")) break;

      tag += tagParts[i] + " ";
    }

    if (tag == "") throw new Error();

    tag.trim();

    for (const contact of contacts) {
      await prisma.tag.upsert({
        where: { tag_user: { tag, user: contact.id.user } },
        update: { authorNumber: author.number },
        create: {
          authorNumber: author.number,
          tag,
          user: contact.id.user,
        },
      });
    }

    await chat.sendMessage("🤖Tags atribuídas com sucesso!🤖");
  } catch (e) {
    await chat.sendMessage("🤖Oops! Algo deu errado!🤖");
  }
};

export const getTags = async (
  chat: WAWebJS.Chat,
  message: WAWebJS.Message,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
) => {
  try {
    let text = "🤖Suas tags são:🤖\n";
    const author = await message.getContact();

    const tags = await prisma.tag.findMany({ where: { user: author.id.user } });

    for (const tag of tags) text += `- ${tag.tag}\n`;

    await chat.sendMessage(text);
  } catch (e) {
    await chat.sendMessage("🤖Oops! Algo deu errado!🤖");
  }
};

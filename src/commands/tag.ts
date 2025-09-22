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

    const tag = message.body.split(" ")[1];

    if (tag.startsWith("@")) throw new Error();

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

    chat.sendMessage("🤖Tags atribuídas com sucesso!🤖");
  } catch (e) {
    chat.sendMessage("🤖Oops! Algo deu errado!🤖");
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

    for (const tag of tags) text += `- ${tag}\n`;

    chat.sendMessage(text);
  } catch (e) {
    chat.sendMessage("🤖Oops! Algo deu errado!🤖");
  }
};

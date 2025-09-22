import WAWebJS, { GroupChat } from "whatsapp-web.js";

export const everyoneCommand = async (chat: GroupChat) => {
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

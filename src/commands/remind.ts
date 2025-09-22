import WAWebJS from "whatsapp-web.js";

export const remindMeCommand = (message: WAWebJS.Message) => {
  try {
    const arg1 = message.body.split(" ")[1];
    const arg2 = message.body.split(" ")[2];

    let mult = 60000;

    if (arg2 == "horas") mult *= 60;
    else if (arg2 == "dias") mult *= 60 * 24;
    else throw new Error();

    const time = parseInt(arg1) * mult;

    setTimeout(() => {
      message.reply("🤖Lembra disso aqui?🤖");
    }, time);

    message.reply("🤖Okay! Já te lembro!🤖");
  } catch (e) {
    message.reply(
      "Opa! Acho que sua sintaxe está errada.\n Tente escrever na forma `!remindme <tempo> <minutos|horas|dias>`"
    );
  }
};

export const remindThisCommand = async (message: WAWebJS.Message) => {
  try {
    const arg1 = message.body.split(" ")[1];
    const arg2 = message.body.split(" ")[2];

    const replied = await message.getQuotedMessage();

    if (!replied) throw new Error();

    let mult = 60000;

    if (arg2 == "horas") mult *= 60;
    else if (arg2 == "dias") mult *= 60 * 24;
    else throw new Error();

    const time = parseInt(arg1) * mult;

    setTimeout(() => {
      replied.reply("🤖Lembra disso aqui?🤖");
    }, time);

    message.reply("🤖Okay! Já te lembro!🤖");
  } catch (e) {
    message.reply(
      "Opa! Acho que sua sintaxe está errada.\n Tente escrever na forma `!remindthis <tempo> <minutos|horas|dias>.\nNão se esqueça de marcar a mensagem a ser respondida!`"
    );
  }
};

import fs from "fs";
import WAWebJS from "whatsapp-web.js";

export const saveSticker = async (message: WAWebJS.Message) => {
  if (!fs.existsSync("stickers")) fs.mkdirSync("stickers");

  const sticker = await message.downloadMedia();
  const data = sticker.data.replace(/^data:image\/\w+;base64,/, "");

  const buffer = Buffer.from(data, "base64");
  const foundSticker = fs.existsSync("stickers/" + message.mediaKey + ".png");

  if (!foundSticker)
    fs.writeFileSync(
      "stickers/" + message.mediaKey?.replace(/[/]/g, ".") + ".png",
      buffer
    );

  return sticker;
};

import ClearedHistory from "../model/ClearedHistories.js";
import User from "../model/Users.js";
import { BotResponseError } from "../../tool/error.js";

const createClearedHistory = async (data, history) => {
  await ClearedHistory.create({
    ...data,
    histories: [history],
  });
};

const updateClearedHistory = async (data, history, oldClearedHistory) => {
  const { chatId } = data;
  const oldHistories = oldClearedHistory.histories;
  const mergedHistory = [...oldHistories, history];
  await ClearedHistory.updateOne(
    { chatId },
    {
      $set: {
        histories: mergedHistory,
      },
    },
  );
};

const deleteOldHistory = async (chatId) => {
  await User.deleteOne({ chatId });
};

export const moveHistory = async (
  {
    id: chatId,
    first_name: firstName,
    last_name: lastName,
    username,
    type,
    is_bot: isBot,
    language_code: languageCode,
    date,
  },
  history,
  oldClearedHistory,
) => {
  if (!history) throw new BotResponseError("[History chat masih kosong]");
  const data = {
    chatId,
    firstName,
    lastName,
    username,
    type,
    isBot,
    languageCode,
    date,
  };
  oldClearedHistory
    ? await updateClearedHistory(data, history, oldClearedHistory)
    : await createClearedHistory(data, history);
  await deleteOldHistory(chatId);
};

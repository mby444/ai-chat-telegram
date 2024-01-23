import User from "../model/Users.js";

const createUserHistory = async (data) => {
  await User.create(data);
};

const updateUserHistory = async (data, oldUser) => {
  const { chatId, history } = data;
  const { history: oldHistory } = oldUser;
  const mergedHistory = [...oldHistory, ...history];
  await User.updateOne(
    { chatId },
    {
      $set: {
        history: mergedHistory,
      },
    },
  );
};

export const saveUserHistory = async (
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
  prompt,
  response,
  oldUser,
) => {
  const newHistory = [
    {
      role: "user",
      parts: prompt,
    },
    {
      role: "model",
      parts: response,
    },
  ];
  const data = {
    chatId,
    firstName,
    lastName,
    username,
    type,
    isBot,
    languageCode,
    date,
    history: newHistory,
  };
  oldUser
    ? await updateUserHistory(data, oldUser)
    : await createUserHistory(data);
};

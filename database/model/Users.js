import { model, Schema } from "mongoose";

const userSchema = new Schema({
  chatId: Number,
  firstName: String,
  lastName: String,
  username: String,
  type: String,
  isBot: Boolean,
  languageCode: String,
  date: Number,
  history: [
    {
      role: String,
      parts: String,
    },
  ],
});

export default model("users", userSchema);

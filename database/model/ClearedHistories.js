import { model, Schema } from "mongoose";

const clearedHistorySchema = new Schema({
  chatId: Number,
  firstName: String,
  lastName: String,
  username: String,
  type: String,
  isBot: Boolean,
  languageCode: String,
  date: Number,
  histories: [
    [
      {
        role: String,
        parts: String,
      },
    ],
  ],
});

export default model("cleared_histories", clearedHistorySchema);

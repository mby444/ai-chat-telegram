import { model, Schema } from "mongoose";

const clearedHistorySchema = new Schema({
    id: Number,
    histories: [
        [
            {
                role: String,
                parts: String,
            },
        ],
    ],
});

export default model("users", clearedHistorySchema);
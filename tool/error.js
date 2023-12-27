export class BotResponseError extends Error {
    static async sendMessage(bot, chatId, err) {
        const defaultMessage = "[An error occurred when processing your chat]";
        const errorMessage = err instanceof BotResponseError ? err.message : defaultMessage;
        await bot.sendMessage(chatId, errorMessage);
    }

    constructor(message = "") {
        super(message);
    }
}
export class BotResponseError extends Error {
    static async sendMessage(bot, chatId, err, options = {}) {
        const defaultMessage = options?.defaultMessage || "[Telah terjadi kesalahan ketika memproses pesan anda]";
        const errorMessage = err instanceof BotResponseError ? err.message : defaultMessage;
        await bot.sendMessage(chatId, errorMessage);
    }

    constructor(message = "") {
        super(message);
    }
}
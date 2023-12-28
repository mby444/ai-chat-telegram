export class BotResponseError extends Error {
    static async sendMessage(bot, chatId, err) {
        const defaultMessage = "[Telah terjadi kesalahan ketika memproses pesan anda, mohon ajukan pertanyaan yang jelas]";
        const errorMessage = err instanceof BotResponseError ? err.message : defaultMessage;
        await bot.sendMessage(chatId, errorMessage);
    }

    constructor(message = "") {
        super(message);
    }
}
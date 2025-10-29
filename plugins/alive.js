import { bot } from '#lib';
import { config } from '#config';
import { aliveMessage, setAliveMsg } from '#sql';

bot(
	{
		pattern: 'alive',
		public: true,
		desc: 'Is Bot Alive?',
		type: 'user'
	},
	async (message, match) => {
		if (match) {
			await setAliveMsg(match);
			return message.send('_Alive Updated_');
		}
		const msg = await aliveMessage(message);
		const botInfo = config.BOT_INFO.split(';')[2];
		const mentionData = {
			mentions: [message.sender],
			contextInfo: {
				mentionedJid: [message.sender]
			}
		};
		return botInfo
			? message.send(botInfo, { ...mentionData, caption: msg })
			: message.send(msg, mentionData);
	}
);

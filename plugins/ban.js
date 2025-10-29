import { bot } from '#lib';
import { addBan, getBanned, removeBan, isSudo } from '#sql';

bot(
	{
		pattern: 'ban ?(.*)',
		public: false,
		desc: 'Ban a user from the bot',
		type: 'user',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		if (await isSudo(jid, message.user)) return message.send('_You cannot ban a sudo user_');
		const msg = await addBan(jid);
		return await message.send(msg, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'unban ?(.*)',
		public: false,
		desc: 'Unban a user from the bot',
		type: 'user',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const msg = await removeBan(jid);
		return await message.send(msg, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'getban',
		public: false,
		desc: 'Get a list of all banned users',
		type: 'user',
	},
	async message => {
		const bannedUsers = await getBanned();
		if (bannedUsers.length === 0) return message.send('_No banned users._');
		const mentions = bannedUsers.map(jid => `${jid}@s.whatsapp.net`);
		return message.send('*_Banned Users:_*\n' + bannedUsers.map((jid, index) => `${index + 1}. @${jid}`).join('\n'), { mentions });
	},
);

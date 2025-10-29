import { bot } from '#lib';
import { addAKick, delKick, getKicks } from '#sql';

bot(
	{
		pattern: 'akick',
		public: false,
		isGroup: true,
		desc: 'Adds a member to auto-kick list.',
		type: 'autokick',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');

		const groupId = message.jid;
		const jid = await message.getUserJid(match);

		const added = await addAKick(groupId, jid);
		return message.send(added ? `_User added to auto-kick list._ @${jid.split('@')[0]}` : `_User is already on the list._ @${jid.split('@')[0]}`, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'akickdel',
		public: false,
		isGroup: true,
		desc: 'Removes a member from the auto-kick list.',
		type: 'autokick',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');

		const groupId = message.jid;
		const jid = await message.getUserJid(match);

		const deleted = await delKick(groupId, jid);
		return message.send(deleted ? `_User removed from auto-kick list._ @${jid.split('@')[0]}` : `_User was not on the list._ @${jid.split('@')[0]}`, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'getakick',
		public: false,
		isGroup: true,
		desc: 'Shows all members in the auto-kick list.',
		type: 'autokick',
	},
	async message => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');

		const groupId = message.jid;
		const kicks = await getKicks(groupId);

		if (kicks.length > 0) {
			return message.send(`_Users in auto-kick list:_\n${kicks.map(k => `• @${k.userJid.split('@')[0]}`).join('\n')}`, { mentions: [kicks] });
		}
		return message.send('_No users found in the auto-kick list._');
	},
);

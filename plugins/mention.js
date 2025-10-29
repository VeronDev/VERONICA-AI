import { bot } from '#lib';
import { setMention, delMention, isMention, getMention } from '#sql';

bot(
	{
		pattern: 'mention',
		public: false,
		isGroup: true,
		desc: 'Setup Reply for Mention Messages',
		type: 'mentions',
	},
	async message => {
		return message.send(
			`
\`\`\`
Mentions Setup

${message.prefix}mention to get mention menu
${message.prefix}setmention (your message here) or reply a message/video/audio or any kind of message
${message.prefix}delmention (this will delete mention for that particaular group)
${message.prefix}getmention (this will give you the mention message set for that group)
\`\`\`
            `,
		);
	},
);

bot(
	{
		pattern: 'setmention',
		public: false,
		isGroup: true,
		desc: 'Setup mention for A Group',
		type: 'mentions',
	},
	async (message, match) => {
		const replyMsg = match || message.reply_message;
		if (!replyMsg) return message.send(`_You didn't give me a message to use reply a mention, Eg. ${message.prefix}setmention hello there_`);
		await setMention(message.jid, replyMsg);
		return message.send('_Mention has been Updated_');
	},
);

bot(
	{
		pattern: 'delmention',
		public: false,
		isGroup: true,
		desc: 'Deletes a mention for a group',
		type: 'mentions',
	},
	async message => {
		if (!(await isMention(message.jid))) return message.send('_Mention Alreay off_');
		await delMention(message.jid);
		return message.send('_Mention Deleted for this Group_');
	},
);

bot(
	{
		on: 'groups-chat',
		dontAddCommandList: true,
	},
	async message => {
		if (message.sender === message.user) return;
		if (message.mention?.includes(message.user)) {
			let reply = await getMention(message.jid);
			if (!reply) return;
			await message.client.relayMessage(message.jid, reply.message, {});
			try {
				if (!JSON.parse(reply)) return message.send(reply);
			} catch {}
		}
	},
);

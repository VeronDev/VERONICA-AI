import { bot } from '#lib';
import { ensureContextInfoWithMentionedJid } from '#utils';

bot(
	{
		pattern: 'tagall',
		public: true,
		isGroup: true,
		desc: 'Tag all participants in the group',
		type: 'group'
	},
	async (message, match) => {
		const msg = match || message.reply_message?.text;
		if (!msg) return message.send('_You must provide a reason for tagging everyone._');
		const participants = await message.client.groupMetadata(message.jid);
		const participantJids = participants.participants.map(p => p.id);
		const tagMsg =
			`*Reason:* ${msg}\n\n` + participantJids.map(jid => `@${jid.split('@')[0]}`).join('\n');
		await message.client.sendMessage(message.jid, {
			text: tagMsg,
			mentions: participantJids
		});
	}
);

bot(
	{
		pattern: 'tag',
		public: true,
        isGroup: true,
		desc: 'Tag Anyone with Any Kind of Message',
		type: 'group'
	},
	async (message, match) => {
		if (!match && !message.reply_message)
			return message.send('_Reply any Message or Give Me Text_');
		if (match && !message.reply_message) {
			const participants = await message.client.groupMetadata(message.jid);
			const participantJids = participants.participants.map(p => p.id);
			await message.send(match, { mentions: participantJids });
		}
		if (!match && message.reply_message) {
			const participants = await message.client.groupMetadata(message.jid);
			const participantJids = participants.participants.map(p => p.id);
			const taggedMessage = await ensureContextInfoWithMentionedJid(
				message.data.quoted.message,
				participantJids
			);
            console.log(taggedMessage)
			await message.client.relayMessage(message.jid, taggedMessage, {});
		}
	}
);

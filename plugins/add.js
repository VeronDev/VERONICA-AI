import baileys from 'baileys';
const { generateWAMessageFromContent, getBinaryNodeChild, proto } = baileys;
import { bot } from '#lib';

bot(
	{
		pattern: 'add',
		public: false,
		isGroup: true,
		desc: 'Adds a user to the group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');

		const jid = await message.getUserJid(match);

		try {
			const pp = await message.client.profilePictureUrl(message.jid).catch(() => null);
			const jpegThumbnail = pp ? await (await fetch(pp)).buffer() : Buffer.alloc(0);

			const response = await message.client.query({
				tag: 'iq',
				attrs: { type: 'set', xmlns: 'w:g2', to: message.jid },
				content: [{ tag: 'add', attrs: {}, content: [{ tag: 'participant', attrs: { jid } }] }],
			});

			const add = getBinaryNodeChild(response, 'add');
			const userNode = getBinaryNodeChild(add, 'participant');
			const content = getBinaryNodeChild(userNode, 'add_request');
			const invite_code = content.attrs.code;
			const invite_code_exp = content.attrs.expiration;

			const gName = await message.client.groupMetadata(message.jid);
			const captionn = `_Join ${gName.subject}_`;

			const groupInvite = generateWAMessageFromContent(
				message.jid,
				proto.Message.fromObject({
					groupInviteMessage: {
						groupJid: message.jid,
						inviteCode: invite_code,
						inviteExpiration: invite_code_exp,
						groupName: gName.subject,
						caption: captionn,
						jpegThumbnail: jpegThumbnail,
					},
				}),
				{ userJid: jid },
			);

			await message.client.relayMessage(jid, groupInvite.message, { messageId: groupInvite.key.id });
			return message.send('_I have invited the user to the group_');
		} catch {
			return message.send('_This Person is already in the Group_');
		}
	},
);

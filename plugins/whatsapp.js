import { config } from '#config';
import { bot, serialize } from '#lib';
import { convertNormalMessageToViewOnce, ModifyViewOnceMessage, toJid } from '#utils';
import { delay, isJidGroup } from 'baileys';

bot(
	{
		pattern: 'vv',
		public: false,
		desc: 'Downloads A Viewonce Message',
		type: 'whatsapp'
	},
	async message => {
		if (!message.reply_message.viewonce) return message.send('_Reply A Viewonce Message_');
		const res = await ModifyViewOnceMessage(message.id, message.client);
		return message.client.relayMessage(message.jid, res.message, {});
	}
);

bot(
	{
		pattern: 'tovv',
		public: true,
		desc: 'Converts A Normal Media Message to ViewOnce',
		type: 'whatsapp'
	},
	async message => {
		if (
			!message.reply_message.video &&
			!message.reply_message.audio &&
			!message.reply_message.image
		)
			return message.send('_Reply an Image | Video | Audio_');
		const viewonceMessage = await convertNormalMessageToViewOnce(message.data.quoted.message);
		return message.client.relayMessage(message.jid, viewonceMessage, {});
	}
);

bot(
	{
		pattern: 'myname',
		public: false,
		type: 'whatsapp',
		desc: 'Changes your WhatsApp Name'
	},
	async (message, match) => {
		if (!match) return message.send('_Provide A New Name_');
		await message.updateName(match.toString());
		return message.send('_WhatsApp Name Updated!_');
	}
);

bot(
	{
		pattern: 'setpp',
		public: false,
		type: 'whatsapp',
		desc: 'Set Your Profile Picture'
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const img = await message.download();
		await message.updatePP(img);
		return await message.send('_Profile Picture Updated_');
	}
);

bot(
	{
		pattern: 'quoted',
		public: false,
		type: 'whatsapp',
		desc: 'quoted message'
	},
	async message => {
		if (!message.reply_message) return await message.send('```Reply A Message```');
		let key = message.reply_message.key.id;
		let msg = await message.client.loadMessage(key);
		if (!msg) return await message.send('```I will not quoted My Messages```');
		msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
		if (!msg.quoted) return await message.send('_No quoted message found_');
		await message.forward(message.jid, msg.quoted, {
			quoted: msg.quoted
		});
	}
);

bot(
	{
		pattern: 'dlt',
		public: false,
		type: 'whatsapp',
		desc: 'Deletes Message'
	},
	async message => {
		if (!message.reply_message) return message.send('_Reply A Message_');
		return await message.delete();
	}
);

bot(
	{
		pattern: 'archive',
		public: false,
		type: 'whatsapp',
		desc: 'archive whatsapp chat'
	},
	async message => {
		await message.archiveChat(true);
		await message.send('_Archived_');
	}
);

bot(
	{
		pattern: 'unarchive',
		public: false,
		type: 'whatsapp',
		desc: 'unarchive whatsapp chat'
	},
	async message => {
		await message.archiveChat(false);
		await message.send('_Unarchived_');
	}
);

bot(
	{
		pattern: 'blocklist',
		public: false,
		type: 'whatsapp',
		desc: 'Fetches BlockList'
	},
	async message => {
		const blocklist = await message.client.fetchBlocklist();
		if (blocklist.length > 0) {
			const mentions = blocklist.map(number => `${number}`);
			const formattedList = blocklist.map(number => `• @${number.split('@')[0]}`).join('\n');
			await message.send(`*_Blocked contacts:_*\n\n${formattedList}`, {
				mentions
			});
		} else {
			await message.send('_No blocked Numbers!_');
		}
	}
);

bot(
	{
		pattern: 'clear ?(.*)',
		public: false,
		type: 'whatsapp',
		desc: 'delete whatsapp chat'
	},
	async message => {
		await message.clearChat();
		await delay(2000);
		await message.send('_Cleared_');
	}
);

bot(
	{
		pattern: 'rpp',
		public: false,
		type: 'whatsapp',
		desc: 'Removes Profile Picture'
	},
	async message => {
		await message.rPP();
		return message.send('_Profile Picture Removed!_');
	}
);

bot(
	{
		pattern: 'pin',
		public: false,
		type: 'whatsapp',
		desc: 'pin a chat'
	},
	async message => {
		await message.client.chatModify({ pin: true }, message.jid);
		return message.send('_Pined_');
	}
);

bot(
	{
		pattern: 'unpin ?(.*)',
		public: false,
		type: 'whatsapp',
		desc: 'unpin a msg'
	},
	async message => {
		await message.client.chatModify({ pin: false }, message.jid);
		return message.send('_Unpined_');
	}
);

bot(
	{
		pattern: 'save',
		public: false,
		type: 'whatsapp',
		desc: 'Saves Status'
	},
	async message => {
		if (!message.reply_message) return message.send('_Reply A Status_');
		await message.forward(message.user, message.data?.quoted, {
			force: false,
			quoted: msg
		});
	}
);

bot(
	{
		pattern: 'forward',
		public: false,
		type: 'whatsapp',
		desc: 'Forwards A Replied Message'
	},
	async (message, match) => {
		if (!message.reply_message) return message.send('_Reply A Message!_');
		let jid;
		if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (isJidGroup(match)) {
			return message.send('_Use Gforward command to forward to groups_');
		} else if (!isJidGroup(match)) {
			jid = toJid(match);
		}
		if (!jid) return message.send('_You have to provide a number/tag someone_');
		const msg = message.data?.quoted;
		await message.forward(jid, msg, { quoted: msg });
		return await message.send(`_Message forward to @${jid.split('@')[0]}_`, {
			mentions: [jid]
		});
	}
);

bot(
	{
		pattern: 'block',
		public: false,
		type: 'whatsapp',
		desc: 'Blocks A Person'
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		await message.Block(jid);
	}
);

bot(
	{
		pattern: 'unblock',
		public: false,
		type: 'whatsapp',
		desc: 'Unblocks A Person'
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		await message.Unblock(jid);
	}
);

bot(
	{
		pattern: 'edit',
		public: false,
		type: 'whatsapp',
		desc: 'Edits A Sent Message'
	},
	async (message, match, { prefix }) => {
		if (!message.reply_message) return message.send('_Reply Your Own Message_');
		if (!match) return await message.send('```' + prefix + 'edit hello```');
		await message.edit(match);
	}
);

bot(
	{
		pattern: 'jid',
		public: true,
		type: 'whatsapp',
		desc: 'Get Jid of Current Chat'
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		message.send(jid);
	}
);

bot(
	{
		pattern: 'bio',
		public: true,
		type: 'whatsapp',
		desc: 'Change your whatsapp bio'
	},
	async (message, match, { prefix }) => {
		if (!match) return message.send(`_Usage:_\n_${prefix}bio Hello World_`);
		await message.client.updateProfileStatus(match);
		return await message.send('```WhatsApp bio Updated to "' + match + '"```');
	}
);

bot(
	{
		pattern: 'react',
		public: false,
		type: 'whatsapp',
		desc: 'React to A Message'
	},
	async (message, match) => {
		if (!message.reply_message) return message.send('_Reply Message_');
		if (!match) return message.send('```react 😊```');
		return message.client.sendMessage(message.jid, {
			react: { text: match, key: message.reply_message.key }
		});
	}
);

bot(
	{
		pattern: 'star',
		public: false,
		type: 'whatsapp',
		desc: 'Stars or Unstars a Message'
	},
	async message => {
		if (!message.reply_message) return message.send('_Reply to a message to star it_');
		const messages = [{ id: message.reply_message.id, fromMe: message.reply_message.fromMe }];
		const star = true;
		return await message.client.star(message.jid, messages, star);
	}
);

bot(
	{
		pattern: 'unstar',
		public: false,
		type: 'whatsapp',
		desc: 'Stars or Unstars a Message'
	},
	async message => {
		const replyMessage = message.reply_message;
		if (!replyMessage) return message.send('_Reply to a message to star it_');
		const jid = message.jid;
		const messages = [{ id: replyMessage.id, fromMe: replyMessage.fromMe }];
		const star = false;
		await message.client.star(jid, messages, star);
	}
);

bot(
	{
		pattern: 'owner',
		public: true,
		type: 'whatsapp',
		desc: 'Get Bot Owner'
	},
	async message => {
		const name = await message.client.getName(message.user);
		const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${config.BOT_INFO.split(';')[0]}
TEL;type=CELL;type=VOICE;waid=${message.user.split('@')[0]}:${message.user.split('@')[0]}
END:VCARD
`;

		return await message.client.sendMessage(message.jid, {
			contacts: {
				displayName: name,
				contacts: [{ vcard }]
			}
		});
	}
);
bot(
	{
		pattern: 'gjid',
		public: true,
		type: 'whatsapp',
		isGroup: true,
		desc: 'Get JID of the Current Group'
	},
	async message => {
		message.send(`Group JID: ${message.jid}`);
	}
);

bot(
	{
		pattern: 'gforward',
		public: false,
		type: 'whatsapp',
		desc: 'Forwards a replied message to multiple groups'
	},
	async (message, match) => {
		if (!message.reply_message) return message.send('_Reply to a message to forward it!_');
		if (!match) return message.send('_Provide a comma-separated list of group JIDs._');
		const groupJids = match
			.split(',')
			.map(jid => jid.trim())
			.filter(isJidGroup);

		const msg = message.data?.quoted;
		await Promise.all(groupJids.map(jid => message.forward(jid, msg, { quoted: msg })));
		return message.send(`_Message forwarded to ${groupJids.length} group(s)._`);
	}
);

bot(
	{
		pattern: 'ptv',
		public: true,
		desc: 'Convert video to pvt video note',
		type: 'whatsapp'
	},
	async message => {
		let media;
		if (!message.reply_message.video) return message.send('_Reply A Video_');
		media = await message.download();
		return await message.send(media, { ptv: true });
	}
);

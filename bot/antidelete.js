import { isJidGroup } from 'baileys';
import { getAnti } from '#sql';

const DeletedText = async (conn, msg, jid, deleteInfo, isGroup, update) => {
	const messageContent =
		msg.message?.conversation || msg.message?.extendedTextMessage?.text || 'Unknown content';
	deleteInfo += `\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${messageContent}`;

	await conn.sendMessage(
		jid,
		{
			text: deleteInfo,
			contextInfo: {
				mentionedJid: isGroup
					? [update.key.participant, msg.key.participant]
					: [update.key.remoteJid]
			}
		},
		{ quoted: msg }
	);
};

const DeletedMedia = async (conn, msg, jid) => {
	const antideletedMsg = JSON.parse(JSON.stringify(msg.message));
	const messageType = Object.keys(antideletedMsg)[0];
	if (antideletedMsg[messageType]) {
		antideletedMsg[messageType].contextInfo = {
			stanzaId: msg.key.id,
			participant: msg.sender,
			quotedMessage: msg.message
		};
	}
	await conn.relayMessage(jid, antideletedMsg, {});
};

export const AntiDelete = async (conn, updates) => {
	for (const update of updates) {
		if (update.key && (update.update.deleteMessage || update.update?.message === null)) {
			const store = await conn.loadMessage(update.key.id);

			if (store && store.message) {
				const msg = store.message;
				const isGroup = isJidGroup(store.jid);
				const antiDeleteType = isGroup ? 'gc' : 'dm';
				const antiDeleteStatus = await getAnti(antiDeleteType);
				if (!antiDeleteStatus) continue;

				const deleteTime = new Date().toLocaleTimeString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				});

				let deleteInfo, jid;
				if (isGroup) {
					const groupMetadata = await conn.groupMetadata(store.jid);
					const groupName = groupMetadata.subject;
					const sender = msg.key.participant?.split('@')[0];
					const deleter = update.key.participant?.split('@')[0];

					deleteInfo = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ɢʀᴏᴜᴘ:* ${groupName}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleter}\n*sᴇɴᴅᴇʀ:* @${sender}`;
					jid = store.jid;
				} else {
					const senderNumber = msg.key.remoteJid?.split('@')[0];
					const deleterNumber = update.key.remoteJid?.split('@')[0];

					deleteInfo = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}`;
					jid = conn.user.id;
				}

				if (msg.message?.conversation || msg.message?.extendedTextMessage) {
					await DeletedText(conn, msg, jid, deleteInfo, isGroup, update);
				} else {
					await DeletedMedia(conn, msg, jid, deleteInfo, isGroup, update);
				}
			}
		}
	}
};

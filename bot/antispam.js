import { getAntiSpamMode, isSudo } from '#sql';
import { isJidGroup } from 'baileys';
const messageStore = new Map();
const deleteCount = new Map();

export async function AntiSpammer(msg) {
	if (!msg.from || msg.isStatus || (await isSudo(msg.sender, msg.user))) return;
	const isGroup = isJidGroup(msg.from);
	const sender = msg.sender;
	const mode = await getAntiSpamMode(isGroup ? msg.from : 'global');
	if (mode === 'off' || msg.isAdmin) return;

	const now = Date.now();
	const senderKey = `${msg.from}-${sender}`;
	const userMessages = messageStore.get(senderKey) || [];
	userMessages.push({ timestamp: now, key: msg.key });

	const recentMessages = userMessages.filter(msgInfo => now - msgInfo.timestamp <= 10000);
	messageStore.set(senderKey, recentMessages);
	if (recentMessages.length < 3) return;
	if (isGroup && mode === 'delete') {
		for (const msgInfo of recentMessages) {
			await msg.client.sendMessage(msg.from, {
				delete: msgInfo.key,
			});
		}
		deleteCount.set(sender, (deleteCount.get(sender) || 0) + 1);
		if (deleteCount.get(sender) > 2) {
			await msg.client.groupParticipantsUpdate(msg.from, [sender], 'remove');
		}
		await msg.send(`\`\`\`@${sender.split('@')[0]} your messages have been deleted as they were detected as spam. Be careful, kid!\`\`\``, { mentions: [sender] });
	} else if (!isGroup && mode === 'block') {
		await msg.send(`\`\`\`@${sender.split('@')[0]} you have been blocked for spamming\`\`\``, { mentions: [sender] });
		return await msg.client.updateBlockStatus(sender, 'block');
	}
	messageStore.delete(senderKey);
}

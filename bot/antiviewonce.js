import { getSettings } from '#sql';
import { isJidGroup } from 'baileys';

export async function AntiViewOnce(msg) {
	if (!msg.viewonce) return;

	const settings = await getSettings();
	if (!settings.isEnabled) return;

	const isGroup = isJidGroup(msg.from);
	if (settings.type === 'gc' && !isGroup) return;
	if (settings.type === 'dm' && isGroup) return;

	const modifiedMessage = JSON.parse(JSON.stringify(msg.message));
	const messageType = Object.keys(modifiedMessage)[0];

	if (modifiedMessage[messageType]) {
		delete modifiedMessage[messageType].viewOnce;
		modifiedMessage[messageType].contextInfo = {
			stanzaId: msg.key.id,
			participant: msg.sender,
			quotedMessage: msg.message,
		};
	}

	await msg.client.relayMessage(msg.from, modifiedMessage, {});
}

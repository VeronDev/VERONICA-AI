import { config } from '#config';
import { getGroupMetadata } from '#sql';

export async function MessagesDebug(msg) {
	if (config.DEBUG) {
		if (msg.isGroup) {
			const group = await getGroupMetadata(msg.from);
			if (!group || !group.subject) return;
			console.log(
				`GROUP: ${group.subject}\nMEMBER: ${msg.pushName}\nMESSAGE: ${msg.type}:${msg.body || ''}`
			);
		} else {
			console.log(
				`FROM: ${msg.from}\nCHAT: ${msg.pushName}\nMESSAGE: ${msg.type}:${msg.body || ''}`
			);
		}
	}
}

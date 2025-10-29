import { commands } from '#lib';
import { isStickerCmd } from '#sql';
import Message from '../lib/class.js';

export async function StickerCMD(msg) {
	if (msg.type === 'stickerMessage') {
		const data = await isStickerCmd(
			Buffer.from(msg.message.stickerMessage.fileSha256).toString('hex')
		);
		const inst = new Message(msg.client, msg);
		if (!data.exists) return;

		for (const command of commands) {
			const commandName = command.pattern.toString().split(/\W+/)[2];
			if (commandName === data.command.cmd) {
				await command.function(inst, msg.body);
				break;
			}
		}
	}
}

import { bot } from '#lib';
import { getAnti, setAnti, initializeAntiDeleteSettings } from '#sql';
initializeAntiDeleteSettings();

bot(
	{
		pattern: 'antidelete',
		public: false,
		desc: 'Setup Antidelete',
		type: 'user'
	},
	async (message, match) => {
		const command = match?.toLowerCase();

		if (command === 'on') {
			await setAnti('gc', false);
			await setAnti('dm', false);
			return await message.send(
				'_AntiDelete is now off for Group Chats and Direct Messages by default. Use "set gc" or "set dm" to enable._'
			);
		}

		if (command === 'off gc') {
			await setAnti('gc', false);
			return await message.send('_AntiDelete for Group Chats is now disabled._');
		}

		if (command === 'off dm') {
			await setAnti('dm', false);
			return await message.send('_AntiDelete for Direct Messages is now disabled._');
		}

		if (command === 'set gc') {
			const currentStatus = await getAnti('gc');
			const newStatus = !currentStatus;
			await setAnti('gc', newStatus);
			return await message.send(
				`_AntiDelete for Group Chats ${newStatus ? 'enabled' : 'disabled'}_`
			);
		}

		if (command === 'set dm') {
			const currentStatus = await getAnti('dm');
			const newStatus = !currentStatus;
			await setAnti('dm', newStatus);
			return await message.send(
				`_AntiDelete for Direct Messages ${newStatus ? 'enabled' : 'disabled'}_`
			);
		}

		if (command === 'set all') {
			await setAnti('gc', true);
			await setAnti('dm', true);
			return await message.send('_AntiDelete set for all chats_');
		}

		if (command === 'status') {
			const dmStatus = await getAnti('dm');
			const gcStatus = await getAnti('gc');

			let statusMessage = '_AntiDelete Status_\n\n';
			statusMessage += `*DM AntiDelete:* ${dmStatus ? 'Enabled' : 'Disabled'}\n`;
			statusMessage += `*Group Chat AntiDelete:* ${gcStatus ? 'Enabled' : 'Disabled'}\n`;
			return await message.send(statusMessage);
		}

		const helpMessage = `*AntiDelete Command Guide:*
• \`\`.antidelete on\`\` - Reset AntiDelete for all chats (disabled by default)
• \`\`.antidelete off gc\`\` - Disable AntiDelete for Group Chats
• \`\`.antidelete off dm\`\` - Disable AntiDelete for Direct Messages
• \`\`.antidelete set gc\`\` - Toggle AntiDelete for Group Chats
• \`\`.antidelete set dm\`\` - Toggle AntiDelete for Direct Messages
• \`\`.antidelete set all\`\` - Enable AntiDelete for all chats
• \`\`.antidelete status\`\` - Check current AntiDelete status`;
		return await message.send(helpMessage);
	}
);

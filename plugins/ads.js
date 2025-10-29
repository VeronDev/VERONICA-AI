import { bot } from '#lib';
import { delay } from 'baileys';

bot(
	{
		pattern: 'advertise',
		public: false,
		isGroup: true,
		desc: 'Create and Share Advertisement Messages to all Your Groups',
		type: 'group',
	},
	async (message, match) => {
		const adMsg = match || message.reply_message?.text;
		if (!adMsg) {
			return message.send('_I need a Message to Advertise_');
		}

		const groups = await message.client.groupFetchAllParticipating();
		const groupIds = Object.values(groups).map(group => group.id);

		await message.send(`\`\`\`Advertising to ${groupIds.length} groups.\`\`\``);

		const broadcastMessage = `\`\`\`ADVERTSIMENT\n\nINFO:\n\n${adMsg}\`\`\``;
		const messageOptions = {
			forwardingScore: 9999999,
			isForwarded: true,
		};

		for (const groupId of groupIds) {
			await delay(1500);
			await message.send(broadcastMessage, {
				jid: groupId,
				contextInfo: messageOptions,
			});
		}

		return await message.send('```Shared to ' + groupIds.length + ' Groups.```');
	},
);

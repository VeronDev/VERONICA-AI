import { bot } from '#lib';
import { addWarn, getWarn, resetWarn } from '#sql';
import { config } from '#config';

const { WARN_COUNT } = config;

bot(
	{
		pattern: 'warn',
		public: false,
		type: 'warns',
		desc: 'Warn a user for violating rules'
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const { success, warnings } = await addWarn(jid);
		if (!success) return await message.send('```Failed to add warning```');

		const warningCount = parseInt(warnings);
		if (warningCount >= WARN_COUNT) {
			await message.send(
				`\`\`\`User has been warned ${warningCount} times. Maximum limit reached. Taking action!\`\`\``
			);

			if (message.isGroup && message.isBotAdmin) {
				await message.client.groupParticipantsUpdate(message.jid, [jid], 'remove');
				await message.send(`\`\`\`@${jid.split('@')[0]} has been removed from the group\`\`\``, {
					mentions: [jid]
				});
			}
			await message.Block(jid);
			await resetWarn(jid);
		} else {
			const remainingWarns = WARN_COUNT - warningCount;
			await message.send(
				`\`\`\`@${
					jid.split('@')[0]
				} has been warned.\nWarnings: ${warningCount}\nRemaining warnings before action: ${remainingWarns}\`\`\``,
				{ mentions: [jid] }
			);
		}
	}
);

bot(
	{
		pattern: 'getwarn',
		public: false,
		type: 'warns',
		desc: 'Check warnings of a user'
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const { warnings } = await getWarn(jid);
		await message.send(`\`\`\`@${jid.split('@')[0]} has ${warnings} warnings.\`\`\``, {
			mentions: [jid]
		});
	}
);

bot(
	{
		pattern: 'resetwarn',
		public: false,
		type: 'warns',
		desc: 'Reset warnings of a user'
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const { success } = await resetWarn(jid);
		if (success) {
			await message.send('```@' + jid.split('@')[0] + ' is free as a Cow```', { mentions: [jid] });
		}
	}
);

import { bot } from '#lib';
import { setAntilink, getAntilink, removeAntilink } from '#sql';

bot(
	{
		pattern: 'antilink',
		public: false,
		isGroup: true,
		desc: 'Setup Antilink for Groups',
		type: 'group',
	},
	async (message, match, { prefix }) => {
		const jid = message.jid;
		if (!match) return message.send(`\`\`\`ANTILINK SETUP\n\n${prefix}antilink on\n ${prefix}antilink set delete | kick | warn\n${prefix}antilink off\n\`\`\``);

		if (!message.isAdmin) return message.send('```For Group Admins Only!```');
		const args = match.toLowerCase().trim().split(' ');
		const action = args[0];

		if (action === 'on') {
			const existingConfig = await getAntilink(jid, 'on');
			if (existingConfig) return message.send('*_Antilink is already on_*');
			const result = await setAntilink(jid, 'on', '');
			return message.send(result ? '*_Antilink has been turned ON_*' : '*_Failed to turn on Antilink_*');
		}

		if (action === 'off') {
			await removeAntilink(jid, 'on');
			await removeAntilink(jid, 'action');
			return message.send('*_Antilink has been turned OFF_*');
		}
		if (action === 'set') {
			if (args.length < 2) return message.send(`*_Please specify an action: ${prefix}antilink set delete | kick | warn_*`);
			const setAction = args[1];
			if (setAction !== 'delete' && setAction !== 'kick' && setAction !== 'warn') return message.send('*_Invalid action. Choose delete, kick, or warn._*');
			const existingConfig = await getAntilink(jid, 'on');
			if (existingConfig && existingConfig.action === setAction) return message.send(`*_Antilink action is already set to ${setAction}_*`);
			const result = await setAntilink(jid, 'on', setAction);
			return message.send(result ? `*_Antilink action set to ${setAction}_*` : '*_Failed to set Antilink action_*');
		}
		if (action === 'get') {
			const status = await getAntilink(jid, 'on');
			const actionConfig = await getAntilink(jid, 'on');
			return message.send(`*_Antilink Configuration:_*\n` + `Status: ${status ? 'ON' : 'OFF'}\n` + `Action: ${actionConfig ? actionConfig.action : 'Not set'}`);
		}
		return message.send(`*_Use ${prefix}antilink for usage._*`);
	},
);

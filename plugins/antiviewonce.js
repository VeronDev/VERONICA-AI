import { bot } from '#lib';
import { setViewOnce, setViewOnceType, getSettings } from '#sql';

bot(
	{
		pattern: 'antivv',
		public: false,
		desc: 'Setup Anti ViewOnce',
		type: 'settings'
	},
	async (message, match) => {
		const args = match.trim().toLowerCase().split(/\s+/);
		const cmd = args[0];
		const type = args[1];

		if (!cmd) {
			return await message.send(
				`\`\`\`Anti ViewOnce Settings\n\n` +
					`${message.prefix}antivv on - Enable\n` +
					`${message.prefix}antivv off - Disable\n` +
					`${message.prefix}antivv set _[gc/dm/all]_ - Set chat type\n` +
					`${message.prefix}antivv get - Check status\`\`\``
			);
		}

		if (cmd === 'get') {
			const settings = await getSettings();
			return await message.send(
				`\`\`\`Anti ViewOnce Status\n\n` +
					`Status: ${settings.isEnabled ? 'ON' : 'OFF'}\n` +
					`Type: ${settings.type}\`\`\``
			);
		}

		if (cmd === 'set') {
			if (!type || !['gc', 'dm', 'all'].includes(type))
				return await message.send(`\`\`\`Invalid type\nUse: gc, dm, or all\`\`\``);
			await setViewOnceType(type);
			return await message.send(`\`\`\`Chat type set to: ${type}\`\`\``);
		}

		if (!['on', 'off'].includes(cmd))
			return await message.send(`\`\`\`Use: on, off, set, or get\`\`\``);

		await setViewOnce(cmd === 'on');
		return await message.send(`_AntiViewOnce turned On_`);
	}
);

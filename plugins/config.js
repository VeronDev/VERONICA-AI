import { bot, commands } from '#lib';
import { addDisabledCmd, getConfig, isCmdDisabled, removeDisabledCmd, updateConfig } from '#sql';

bot(
	{
		pattern: 'config',
		public: false,
		desc: 'Get Database configurations',
		type: 'settings'
	},
	async message => {
		const db_list = await getConfig();
		const { autoRead, autoStatusRead, cmdReact, mode, PREFIX } = db_list;
		return await message.send(
			`\`\`\`DATABASE CONFIGURATIONS\nAutoRead: ${autoRead}\nAutoReadStatus: ${autoStatusRead}\nCmdReact: ${cmdReact}\nMode: ${
				mode ? 'private' : 'public'
			}\nPrefix: ${PREFIX}\`\`\``
		);
	}
);

bot(
	{
		pattern: 'autoread',
		public: false,
		desc: 'Set bot to automatically read messages',
		type: 'settings'
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.autoRead === newValue)
			return await message.send(`_AutoRead is already set to ${newValue ? 'on' : 'off'}._`);

		await updateConfig('autoRead', newValue);
		return await message.send(`_AutoRead set to ${newValue ? 'on' : 'off'}._`);
	}
);

bot(
	{
		pattern: 'autoreadstatus',
		public: false,
		desc: 'Set bot to automatically read status',
		type: 'settings'
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.autoStatusRead === newValue)
			return await message.send(`_AutoStatusRead is already ${newValue ? 'on' : 'off'}._`);

		await updateConfig('autoStatusRead', newValue);
		return await message.send(`_AutoStatusRead has been turned ${newValue ? 'on' : 'off'}._`);
	}
);

bot(
	{
		pattern: 'autolikestatus',
		public: false,
		desc: 'Set bot to Autolike Status',
		type: 'settings'
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.autolikestatus === newValue)
			return await message.send(`_AutoLikeStatus is already ${newValue ? 'on' : 'off'}._`);

		await updateConfig('autolikestatus', newValue);
		return await message.send(`_AutolikeStatus turned ${newValue ? 'on' : 'off'}._`);
	}
);

bot(
	{
		pattern: 'mode',
		public: false,
		desc: 'Set bot Mode private or public',
		type: 'settings'
	},
	async (message, match) => {
		const newValue = match === 'private' ? true : match === 'public' ? false : null;
		if (newValue === null) return await message.send('_Use "private" or "public"_');
		const dbConfig = await getConfig();
		if (dbConfig.mode === newValue)
			return await message.send(`_Mode is already set to ${newValue ? 'private' : 'public'}._`);

		await updateConfig('mode', newValue);
		return await message.send(`_Mode set to ${newValue ? 'private' : 'public'}._`);
	}
);

bot(
	{
		pattern: 'cmdreact',
		public: false,
		desc: 'Set bot to react to Cmds',
		type: 'settings'
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.cmdReact === newValue)
			return await message.send(`_CmdReact is already set to ${newValue ? 'on' : 'off'}._`);

		await updateConfig('cmdReact', newValue);
		return await message.send(`_CmdReact set to ${newValue ? 'on' : 'off'}._`);
	}
);

bot(
	{
		pattern: 'cmdread',
		public: false,
		desc: 'Set bot to read cmds',
		type: 'settings'
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.cmdRead === newValue)
			return await message.send(`_cmdRead is already set to ${newValue ? 'on' : 'off'}._`);

		await updateConfig('cmdReact', newValue);
		return await message.send(`_CmdRead set to ${newValue ? 'on' : 'off'}._`);
	}
);

bot(
	{
		pattern: 'setprefix',
		public: false,
		desc: 'Setup bot prefix',
		type: 'settings'
	},
	async (message, match, { prefix }) => {
		const newValue = match;
		if (!newValue) return await message.send(`Use ${prefix}setprefix ,\n\nTo set a new prefix for the bot!`);
		await updateConfig('PREFIX', newValue);
		return await message.send(`_Prefix set to "${newValue}"_`);
	}
);

bot(
	{
		pattern: 'disable',
		public: false,
		desc: 'Disable a command',
		type: 'settings'
	},
	async (message, match) => {
		if (!match) return await message.send('_Provide a command to disable_');
		if (match) {
			if (match === 'restart' || match === 'shutdown' || match === 'enable')
				return await message.send('_This command cannot be disabled_');
		}
		const cmds = commands.filter(
			cmd => cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined')
		);
		if (!cmds) return await message.send('_Command not found_');
		if (await isCmdDisabled(match)) return await message.send('_Command already disabled_');
		const result = await addDisabledCmd(match);
		return await message.send(result.message);
	}
);

bot(
	{
		pattern: 'enable',
		public: false,
		desc: 'Enable a command',
		type: 'settings'
	},
	async (message, match) => {
		if (!match) return await message.send('_Provide a command to enable_');
		const cmds = commands.filter(
			cmd => cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined')
		);
		if (!cmds) return await message.send('_Command not found_');
		if (!(await isCmdDisabled(match))) return await message.send('_Command already enabled_');
		const result = await removeDisabledCmd(match);
		return await message.send(result.message);
	}
);

bot(
	{
		pattern: 'disablegc',
		public: false,
		desc: "Turn off the bot's ability to send messages in group chats",
		type: 'settings'
	},
	async message => {
		const dbConfig = await getConfig();
		if (dbConfig.disablegc === true) {
			return await message.send('_Group messaging is already disabled._');
		}

		await updateConfig('disablegc', true);
		return await message.send(
			`\`\`\`Group messaging is now disabled.\nThe bot will no longer function in group chats.\`\`\``
		);
	}
);

bot(
	{
		pattern: 'enablegc',
		public: false,
		desc: "Turn on the bot's ability to send messages in group chats",
		type: 'settings'
	},
	async message => {
		const dbConfig = await getConfig();
		if (dbConfig.disablegc === false) {
			return await message.send('_Group messaging is already enabled._');
		}

		await updateConfig('disablegc', false);
		return await message.send(
			`\`\`\`Group messaging is now enabled.\nThe bot will now function in group chats.\`\`\``
		);
	}
);

bot(
	{
		pattern: 'disabledm',
		public: false,
		desc: "Turn off the bot's ability to send messages in direct/private chats (except yours)",
		type: 'settings'
	},
	async message => {
		const dbConfig = await getConfig();
		if (dbConfig.disabledm === true) {
			return await message.send('_Direct messaging is already disabled._');
		}
		await updateConfig('disabledm', true);
		return await message.send(
			`\`\`\`Direct messaging is now disabled.\nThe bot will no longer function in personal chats, except yours.\`\`\``
		);
	}
);

bot(
	{
		pattern: 'enabledm',
		public: false,
		desc: "Turn on the bot's ability to send messages in direct/private chats",
		type: 'settings'
	},
	async message => {
		const dbConfig = await getConfig();
		if (dbConfig.disabledm === false) {
			return await message.send('_Direct messaging is already enabled._');
		}
		await updateConfig('disabledm', false);
		return await message.send(
			`\`\`\`Direct messaging is now enabled.\nThe bot will function in personal chats.\`\`\``
		);
	}
);

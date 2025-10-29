import { bot, commands } from '#lib';
import { delcmd, getcmd, setcmd } from '#sql';

bot(
	{
		pattern: 'setcmd',
		public: false,
		desc: 'Set bot to execute commands using a sticker',
		type: 'user'
	},
	async (message, match) => {
		if (!message.reply_message?.sticker) {
			return await message.send(
				'_Reply to a sticker and provide a valid command to set it as a sticker command._'
			);
		}
		const cmdExists = commands.some(
			cmd =>
				cmd.pattern &&
				!cmd.dontAddCommandList &&
				!cmd.pattern.toString().includes('undefined') &&
				cmd.pattern.toString().includes(match)
		);

		if (!cmdExists) {
			return await message.send('_The provided command is invalid or not found._');
		}
		const success = await setcmd(
			match,
			Buffer.from(message.data.quoted.message.stickerMessage.fileSha256).toString('hex')
		);
		if (success) {
			return await message.send(`_Command "${match}" successfully set to the sticker._`);
		}
		await message.send('_Failed to set the command._');
	}
);

bot(
	{
		pattern: 'delcmd',
		public: false,
		desc: 'Delete a sticker command',
		type: 'user'
	},
	async (message, match) => {
		if (!match) {
			return await message.send('_Please provide a command to delete._');
		}
		const deleted = await delcmd(match);
		if (deleted) {
			return await message.send(`_Command "${match}" successfully deleted._`);
		}
		return await message.send('_Command not found or could not be deleted._');
	}
);

bot(
	{
		pattern: 'getcmd',
		public: false,
		desc: 'Retrieve all sticker commands',
		type: 'user'
	},
	async message => {
		const cmds = await getcmd();
		if (!cmds.length) {
			return await message.send('_No sticker commands found._');
		}
		return await message.send(`\`\`\`${cmds.map(cmd => cmd.cmd).join('\n')}\`\`\``);
	}
);

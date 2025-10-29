import { bot } from '#lib';
import fs from 'fs';
import path from 'path';

bot(
	{
		pattern: 'file ?(.*)',
		fromMe: true,
		desc: 'Send the content of a specified file',
		type: 'misc'
	},
	async (message, match) => {
		const fileName = match?.trim();
		if (!fileName) return message.send('_Please specify the file name. Example: file `config.js`_');
		const filePath = path.resolve(process.cwd(), fileName);
		if (!fs.existsSync(filePath)) {
			return message.send(`_The file "${fileName}" does not exist._`);
		}
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		return message.send(`*Content of the file "${fileName}":*\n\n\`\`\`${fileContent}\`\`\``);
	}
);

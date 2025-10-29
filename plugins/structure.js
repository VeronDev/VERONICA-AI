import { bot } from '#lib';
import fs from 'fs';
import path from 'path';

function getDirectoryStructure(dir, prefix = '', isLast = true) {
	const files = fs.readdirSync(dir);
	let structure = '';

	files.forEach((file, index) => {
		const isLastItem = index === files.length - 1;
		const filePath = path.join(dir, file);
		const stats = fs.statSync(filePath);
		const isDirectory = stats.isDirectory();

		if (
			file === 'node_modules' ||
			file.startsWith('.git') ||
			file === '.env' ||
			file === '.npm' ||
			file === 'session'
		)
			return;

		structure += `${prefix}${isLast ? '└── ' : '├── '}${file}${isDirectory ? '/' : ''}\n`;

		if (isDirectory) {
			const newPrefix = prefix + (isLast ? '    ' : '│   ');
			structure += getDirectoryStructure(filePath, newPrefix, isLastItem);
		}
	});

	return structure;
}

bot(
	{
		pattern: 'structure',
		public: true,
		desc: 'Get the directory structure of the bot',
		type: 'misc'
	},
	async message => {
		const projectRoot = process.cwd();
		const structureText = `
VeronDev/VERONICA-AI:
${getDirectoryStructure(projectRoot)}`.trim();

		return await message.send(`\`\`\`${structureText}\`\`\``);
	}
);

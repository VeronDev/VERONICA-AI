import { bot, devs } from '#lib';
import { toJid } from '#utils';
import { readFileSync } from 'fs';

bot(
	{
		pattern: 'report',
		public: true,
		desc: 'Request Feature or Report Bugs',
		type: 'help',
	},
	async (message, match) => {
		if (!match || match.split(' ').length < 5) return message.send('```Please provide a reason with at least 5 words to report a bug.```');
		const errorReport = `\`\`\`
BUG REPORT
FROM: @${message.sender.split('@')[0]}
MESSAGE: \n${match}
\`\`\``;
		for (const dev of devs) {
			await message.send(errorReport, {
				jid: toJid(dev),
				mentions: [message.sender],
			});
		}
	},
);

bot(
	{
		pattern: 'repo',
		public: true,
		desc: 'Bot info, social links, and GitHub repo.',
		type: 'help',
	},
	async message => {
		const adMessage = `\`\`\`
Veronica Multi Device WhatsApp Ai
https://github.com/VeronDev/VERONICA-AI 

Help Us Improve: Star, report bugs, or suggest features!
© 2025 VeronDev 
\`\`\``;

		const media = readFileSync('./media/vero.mp4');
		return await message.send(media, {
			caption: adMessage,
			gifPlayback: true,
			contextInfo: {
				forwardingScore: 1,
				isForwarded: true,
				forwardedNewsletterMessageInfo: {
					newsletterJid: '120363397100406773@newsletter',
					newsletterName: 'Vᴇʀᴏ Aɪ',
				},
			},
		});
	},
);

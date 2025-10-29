import { extractUrlFromString, getJson } from '#lib';
import { bot, devs, getUsers } from '#lib';
import { config } from '#config';
import { VERO } from '#utils';
import { evaluate } from 'mathjs';

bot(
	{
		pattern: 'pair',
		public: true,
		desc: 'Get Your Pairing Code Now',
		type: 'help'
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		if (!jid) return message.send('_Give me the number that needs pairing code_');
		const id = jid.split('@')[0];
		const msg = await message.send('*Getting Pairing Code*');
		const res = await getJson(`https://vero-session-u8y9.onrender.com/pair?phone=${id}`);
		if (!res.code) return message.send('*unable to get a pairing code, try again!*');
		return await msg.edit('```Pairing CODE:\n' + res.code + '```');
	}
);

bot(
	{
		pattern: 'support',
		public: true,
		desc: 'Sends developer support information',
		type: 'help'
	},
	async message => {
		const contacts = devs.map(dev => {
			return {
				vcard: `BEGIN:VCARD
VERSION:3.0
FN:Developer ${dev}
ORG:${config.BOT_INFO.split(';')[0]}
TEL;type=CELL;type=VOICE;waid=${dev}:${dev}
END:VCARD`
			};
		});
		return await message.client.sendMessage(message.jid, {
			contacts: {
				displayName: 'Developer Support',
				contacts: contacts
			}
		});
	}
);

bot(
	{
		pattern: 'users',
		public: true,
		desc: 'Get Total Users',
		type: 'help'
	},
	async message => {
		return await message.send(`\`\`\`Veronica Current Users:\n ${(await getUsers()).users}\`\`\``);
	}
);

bot(
	{
		pattern: 'readmore',
		public: true,
		desc: 'Adds *readmore* in given text.',
		type: 'tools'
	},
	async (message, match) => {
		if (!match) return await message.send('*Give me text!*');
		const [text1, text2] = match.split(';');
		if (!text2) return await message.send('*Format: text1;text2*');
		return await message.send(text1 + String.fromCharCode(8206).repeat(4001) + `\n${text2}`);
	}
);

bot(
	{
		pattern: 'fliptext',
		public: true,
		desc: 'Flips given text upside down',
		type: 'misc'
	},
	async (message, match) => {
		if (!match) return await message.send('*Give me text to flip!*');
		const flip = match
			.split('')
			.map(char => {
				const flipped =
					{
						a: 'ɐ',
						b: 'q',
						c: 'ɔ',
						d: 'p',
						e: 'ǝ',
						f: 'ɟ',
						g: 'ƃ',
						h: 'ɥ',
						i: 'ᴉ',
						j: 'ɾ',
						k: 'ʞ',
						l: 'l',
						m: 'ɯ',
						n: 'u',
						o: 'o',
						p: 'd',
						q: 'b',
						r: 'ɹ',
						s: 's',
						t: 'ʇ',
						u: 'n',
						v: 'ʌ',
						w: 'ʍ',
						x: 'x',
						y: 'ʎ',
						z: 'z'
					}[char.toLowerCase()] || char;
				return flipped;
			})
			.reverse()
			.join('');
		return await message.send(flip);
	}
);

bot(
	{
		pattern: 'mp4url',
		public: true,
		desc: 'Get direct mp4 url from video message',
		type: 'misc'
	},
	async (message, match) => {
		if (!match || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(match))
			return message.send('*Please provide a valid URL*');
		const img = await message.getProfileImage(message.sender);
		const url = extractUrlFromString(match);
		return await message.client.sendMessage(message.jid, {
			video: { url: url },
			caption: '*HERE WE GO*',
			contextInfo: {
				externalAdReply: {
					title: config.BOT_INFO.split(';')[0],
					body: message.pushName,
					thumbnail: img || null,
					mediaType: 2,
					mediaUrl: null
				}
			}
		});
	}
);

bot(
	{
		pattern: 'math',
		public: true,
		desc: 'Solve a Maths Expression',
		type: 'misc'
	},
	async (message, match) => {
		if (!match) {
			return await message.send(
				'Please provide a mathematical expression to solve. Example: `.math 2 + 2`'
			);
		}
		const msg = await message.send('*Calculating...*');
		try {
			const result = evaluate(match);
			return await msg.edit(`Result: ${result}`);
		} catch {
			return await msg.edit(`_Invaild Math Operation_`);
		}
	}
);

bot(
	{
		pattern: 'link',
		public: true,
		desc: 'Shortens a url',
		type: 'tools'
	},
	async (message, match) => {
		if (!match || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(match))
			return message.send('*Please provide a valid URL*');
		const msg = await message.send('*Shortening URL...*');
		const url = extractUrlFromString(match);
		const res = await VERO.short(url);
		if (!res) return await msg.edit('*Failed to shorten URL*');
		return await msg.edit(`*Shortened URL:* ${res}`);
	}
);

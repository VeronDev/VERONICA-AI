import { bot } from '#lib';
import { VERO } from '#utils';

bot(
	{
		pattern: 'andrew',
		public: true,
		desc: 'Fake Andrew Tate Tweet',
		type: 'memes',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me words_');
		const res = await VERO.meme(match, 'andrew');
		return await message.send(res);
	},
);

bot(
	{
		pattern: 'elonmusk',
		public: true,
		desc: 'Fake Elon Musk Tweet',
		type: 'memes',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me words_');
		const res = await VERO.meme(match, 'elonmusk');
		return await message.send(res);
	},
);

bot(
	{
		pattern: 'messi',
		public: true,
		desc: 'Fake Messi Tweet',
		type: 'memes',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me words_');
		const res = await VERO.meme(match, 'messi');
		return await message.send(res);
	},
);

bot(
	{
		pattern: 'obama',
		public: true,
		desc: 'Fake Obama Tweet',
		type: 'memes',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me words_');
		const res = await VERO.meme(match, 'obama');
		return await message.send(res);
	},
);

bot(
	{
		pattern: 'ronaldo',
		public: true,
		desc: 'Fake Ronaldo Tweet',
		type: 'memes',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me words_');
		const res = await VERO.meme(match, 'ronaldo');
		return await message.send(res);
	},
);

bot(
	{
		pattern: 'trump',
		public: true,
		desc: 'Fake Trump Tweet',
		type: 'memes',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me words_');
		const res = await VERO.meme(match, 'trump');
		return await message.send(res);
	},
);

import { bot } from '#lib';
import { addFilter, removeFilter, getFilters } from '#sql';

bot(
	{
		pattern: 'filters',
		public: false,
		desc: 'Displays Available Filter Commands and how to use them',
		type: 'filters',
	},
	async message => {
		const Msg = `
Filters Setup

${message.prefix}pfilter hi;hello (To setup filter for direct messages)

${message.prefix}gfilter hello;Hi how are you (To setup filter for group messages)

${message.prefix}delfilter gc hi (To delete a filter set for groups)

${message.prefix}delfilter dm hi (To delete a filter set for direct messages)
        `;
		return await message.send(`\`\`\`${Msg.trim().trim()}\`\`\``);
	},
);

bot(
	{
		pattern: 'pfilter',
		public: false,
		desc: 'Set up DM filters',
		type: 'filters',
	},
	async (message, match) => {
		if (!match.includes(';')) return await message.send('Use the format: pfilter <text>;<response>');

		const [text, response] = match.split(';');
		if (!text || !response) return await message.send('Both text and response are required.');

		const result = await addFilter('dm', text.trim(), response.trim());
		return await message.send(`\`\`\`${result}\`\`\``);
	},
);

bot(
	{
		pattern: 'gfilter',
		public: false,
		desc: 'Set up group chat filters',
		type: 'filters',
	},
	async (message, match) => {
		if (!match.includes(';')) return await message.send('Use the format: gfilter <text>;<response>');

		const [text, response] = match.split(';');
		if (!text || !response) return await message.send('Both text and response are required.');

		const result = await addFilter('gc', text.trim(), response.trim());
		return await message.send(`\`\`\`${result}\`\`\``);
	},
);

bot(
	{
		pattern: 'delfilter',
		public: false,
		desc: 'Delete filters (DM or group)',
		type: 'filters',
	},
	async (message, match) => {
		if (!match.startsWith('gc ') && !match.startsWith('dm ')) {
			return await message.send('Use the format: delfilter <gc/dm> <text>');
		}

		const [type, ...textParts] = match.split(' ');
		const text = textParts.join(' ').trim();
		if (!text) return await message.send('Filter text is required.');

		const result = await removeFilter(type, text);
		return await message.send(`\`\`\`${result}\`\`\``);
	},
);

bot(
	{
		pattern: 'getfilters',
		public: false,
		desc: 'List all filters',
		type: 'filters',
	},
	async message => {
		const dmFilters = await getFilters('dm');
		const gcFilters = await getFilters('gc');

		let response = 'Available Filters:\n\nDirect Message Filters:\n';
		response += dmFilters.length ? dmFilters.map(filter => `• ${filter.word}: ${filter.response}`).join('\n') : 'None';

		response += '\n\nGroup Chat Filters:\n';
		response += gcFilters.length ? gcFilters.map(filter => `• ${filter.word}: ${filter.response}`).join('\n') : 'None';

		return await message.send(`\`\`\`${response}\`\`\``);
	},
);

bot(
	{
		on: 'chats_updates',
		dontAddCommandList: true,
	},
	async message => {
		if (message.sender === message.user) return; // Don't reply to yourself

		const chatType = message.isGroup ? 'gc' : 'dm';
		const filters = await getFilters(chatType);
		const content = message.text?.toLowerCase().trim();

		if (!content || !filters.length) return;

		const matchedFilter = filters.find(filter => filter.word === content);
		if (matchedFilter) {
			await message.send(matchedFilter.response);
		}
	},
);

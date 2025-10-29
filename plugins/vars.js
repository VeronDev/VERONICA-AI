import { bot } from '#lib';
import { manageVar } from '#utils';

bot(
	{
		pattern: 'setvar',
		public: false,
		type: 'system',
		desc: 'Set system var'
	},
	async (message, match) => {
		if (!match) return message.send('_Use: .setvar KEY:VALUE_');
		const input = match.split(':');
		if (input.length !== 2) return message.send('_Use: .setvar KEY:VALUE_');
		const [key, value] = input.map(item => item.trim());
		await manageVar({ command: 'set', key, value });
		return message.send(`*✓ Variable set: ${key}=${value}*`);
	}
);

bot(
	{
		pattern: 'delvar',
		public: false,
		type: 'system',
		desc: 'Delete system var'
	},
	async (message, match) => {
		if (!match) return message.send('_Provide variable name to delete_');
		const key = match.trim();
		await manageVar({ command: 'del', key });
		return message.send(`*✓ Deleted ${key} from env*`);
	}
);

bot(
	{
		pattern: 'getvar',
		public: false,
		type: 'system',
		desc: 'Get system vars'
	},
	async message => {
		const vars = await manageVar({ command: 'get' });
		return message.send(vars || '_No Vars Found_');
	}
);

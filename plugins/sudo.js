import { bot } from '#lib';
import { getSudo, delSudo, addSudo, isSudo } from '#sql';

bot(
	{
		pattern: 'setsudo',
		public: false,
		desc: 'Add User to Sudo list',
		type: 'settings',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		if (await isSudo(jid, message.user)) return message.send('_Already Sudo User_');
		const sudolist = await addSudo(jid);
		return message.send(sudolist, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'delsudo',
		public: false,
		desc: 'Remove User from Sudo',
		type: 'settings',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
		const rsudo = await delSudo(jid);
		return message.send(rsudo, { mentions: [jid] });
	},
);

bot(
	{
		pattern: 'getsudo',
		public: false,
		desc: 'Get Sudo Users',
		type: 'settings',
	},
	async message => {
		const sudoList = await getSudo();
		if (sudoList === '_No Sudo Numbers_') return message.send('*_No Sudo Users_*');
		const sudoNumbers = sudoList.split('\n').map(number => number.split('@')[0]);
		const formattedSudoList = '*_Sudo Users_*\n\n' + sudoNumbers.map((number, index) => `${index + 1}. @${number}`).join('\n');
		const mentions = sudoNumbers.map(number => `${number}@s.whatsapp.net`);
		return message.send(formattedSudoList, { mentions: mentions });
	},
);

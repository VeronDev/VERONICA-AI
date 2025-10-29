import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const BanDB = DATABASE.define(
	'ban',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		timestamps: false,
		tableName: 'ban',
	},
);

export const addBan = async jid => {
	if (!jid) throw new Error('JID is required.');
	await BanDB.create({ jid });
	return `_@${jid.split('@')[0]} has been banned from using commands._`;
};

export const removeBan = async jid => {
	if (!jid) throw new Error('JID is required.');
	const ban = await BanDB.findOne({ where: { jid } });
	if (ban) {
		await ban.destroy();
		return `_@${jid.split('@')[0]} unbanned, and can now use commands._`;
	}
	return `_@${jid.split('@')[0]} wasn't banned._`;
};

export const getBanned = async () => {
	const bannedUsers = await BanDB.findAll();
	return bannedUsers.map(user => user.jid);
};

export const isBanned = async jid => {
	if (!jid) jid = '';
	const bannedUsers = await getBanned();
	return bannedUsers.includes(jid);
};

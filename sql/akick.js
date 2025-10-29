import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

export const AutoKickDB = DATABASE.define(
	'AutoKick',
	{
		groupJid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		userJid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		indexes: [
			{
				unique: true,
				fields: ['groupJid', 'userJid'],
			},
		],
		tableName: 'autokick',
		timestamps: false,
	},
);


export const addAKick = async (groupJid, userJid) => {
	await AutoKickDB.create({ groupJid, userJid });
	return true;
};


export const delKick = async (groupJid, userJid) => {
	const result = await AutoKickDB.destroy({
		where: { groupJid, userJid },
	});
	return result;
};


export const getKicks = async (groupJid, userJid = null) => {
	const whereClause = { groupJid };
	if (userJid) whereClause.userJid = userJid;

	const kicks = await AutoKickDB.findAll({ where: whereClause });
	return kicks.map(kick => kick.get());
};
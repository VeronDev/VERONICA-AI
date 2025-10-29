import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

export const GroupEventDB = DATABASE.define(
	'GroupEvent',
	{
		jid: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	},
	{
		tableName: 'group_event',
		timestamps: false
	}
);

export const enableGroupEvents = async jid => {
	await GroupEventDB.upsert({ jid, enabled: true });
	return true;
};

export const disableGroupEvents = async jid => {
	await GroupEventDB.upsert({ jid, enabled: false });
	return true;
};

export const isGroupEventEnabled = async jid => {
	const record = await GroupEventDB.findOne({ where: { jid } });
	return record?.enabled || false;
};

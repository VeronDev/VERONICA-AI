import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const schedule = DATABASE.define(
	'Schedule',
	{
		groupId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		muteTime: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		unmuteTime: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		isMuted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		isScheduled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		timestamps: false,
		tableName: 'schedules',
	},
);
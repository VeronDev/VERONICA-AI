import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const AutoReact = DATABASE.define(
	'AReact',
	{
		status: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: 'areact',
		timestamps: false,
	},
);

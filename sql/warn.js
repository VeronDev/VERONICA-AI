import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const WarnDB = DATABASE.define(
	'Warn',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		warnings: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	},
	{
		tableName: 'warnings',
		timestamps: false,
	},
);

export const addWarn = async jid => {
	const [user] = await WarnDB.findOrCreate({
		where: { jid },
		defaults: { warnings: 0 },
	});
	user.warnings += 1;
	await user.save();

	return { success: true, warnings: user.warnings };
};

export const getWarn = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	return { success: true, warnings: user ? user.warnings : 0 };
};

export const resetWarn = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	if (user) {
		user.warnings = 0;
		await user.save();
	}
	return { success: true };
};

export const isWarned = async jid => {
	const user = await WarnDB.findOne({ where: { jid } });
	return user ? user.warnings > 0 : false;
};

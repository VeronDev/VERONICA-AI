import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

const AntiBot = DATABASE.define(
	'Antibot',
	{
		jid: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: 'antibot',
	},
);

async function setAntibot(jid, enabled) {
	const [record] = await AntiBot.upsert({
		jid,
		enabled,
	});
	return record;
}

async function delAntibot(jid) {
	return await AntiBot.destroy({
		where: { jid },
	});
}

async function getAntibot(jid) {
	const record = await AntiBot.findByPk(jid);
	return record ? record.enabled : false;
}

export { AntiBot, setAntibot, delAntibot, getAntibot };

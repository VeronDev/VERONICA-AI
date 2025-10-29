import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';
import { isJidGroup } from 'baileys';

const AntiSpam = DATABASE.define(
	'Antispam',
	{
		jid: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
		mode: {
			type: DataTypes.ENUM('off', 'block', 'kick', 'delete'),
			defaultValue: 'off',
		},
	},
	{
		tableName: 'antispam',
		timestamps: true,
	},
);

async function setAntiSpam(jid, mode) {
	const normalizedJid = isJidGroup(jid)
		? jid
		: jid === 'global'
		? 'global'
		: 'global';

	return AntiSpam.upsert({ jid: normalizedJid, mode });
}

async function getAntiSpamMode(jid) {
	const normalizedJid = isJidGroup(jid)
		? jid
		: jid === 'global'
		? 'global'
		: 'global';

	const setting = await AntiSpam.findOne({
		where: { jid: normalizedJid },
	});

	return setting ? setting.mode : 'off';
}

export { AntiSpam, setAntiSpam, getAntiSpamMode };

import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

export const Mention = DATABASE.define(
	'MentionDB',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		message: {
			type: DataTypes.JSON,
			allowNull: true,
		},
	},
	{ tableName: 'mention' },
);

export async function setMention(jid, message) {
	const [mention, created] = await Mention.findOrCreate({
		where: { jid },
		defaults: { message },
	});
	if (!created) await mention.update({ message });
	return true;
}

export async function delMention(jid) {
	const deleted = await Mention.destroy({
		where: { jid },
	});
	return !!deleted;
}

export async function isMention(jid) {
	const mention = await Mention.findOne({
		where: { jid },
	});
	return !!mention;
}

export async function getMention(jid) {
	const mention = await Mention.findOne({
		where: { jid },
	});
	return mention ? mention.message : null;
}

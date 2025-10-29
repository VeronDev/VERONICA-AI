import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';


export const GreetingsDB = DATABASE.define(
	'Greetings',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		type: {
			type: DataTypes.STRING, // 'welcome' or 'goodbye'
			allowNull: false,
			primaryKey: true,
		},
		action: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		message: {
			type: DataTypes.JSON, // Can handle both string and JSON
			allowNull: true,
		},
	},
	{
		tableName: 'greetings',
		timestamps: false,
	},
);

export async function addWelcome(jid, action, message) {
	await GreetingsDB.upsert({ jid, type: 'welcome', action, message });
}

export async function addGoodbye(jid, action, message) {
	await GreetingsDB.upsert({ jid, type: 'goodbye', action, message });
}

export async function getWelcome(jid) {
	const data = await GreetingsDB.findOne({ where: { jid, type: 'welcome' } });
	return data ? { action: data.action, message: data.message } : { action: false, message: null };
}

export async function getGoodbye(jid) {
	const data = await GreetingsDB.findOne({ where: { jid, type: 'goodbye' } });
	return data ? { action: data.action, message: data.message } : { action: false, message: null };
}

export async function isWelcomeOn(jid) {
	const data = await GreetingsDB.findOne({ where: { jid, type: 'welcome' } });
	return data ? data.action : false;
}

export async function isGoodByeOn(jid) {
	const data = await GreetingsDB.findOne({ where: { jid, type: 'goodbye' } });
	return data ? data.action : false;
}

export async function delWelcome(jid) {
	await GreetingsDB.destroy({ where: { jid, type: 'welcome' } });
	await GreetingsDB.create({ jid, type: 'welcome', action: false, message: null });
}

export async function delGoodBye(jid) {
	await GreetingsDB.destroy({ where: { jid, type: 'goodbye' } });
	await GreetingsDB.create({ jid, type: 'goodbye', action: false, message: null });
}

import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

export const AntiCallDb = DATABASE.define(
	'AntiCall',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			defaultValue: 1,
		},
		jid: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		type: {
			type: DataTypes.ENUM('on', 'all', 'set'),
			defaultValue: 'on',
		},
		action: {
			type: DataTypes.ENUM('block', 'reject'),
			defaultValue: 'block',
		},
		on: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		tableName: 'anticall',
		timestamps: false,
	},
);

export async function addAntiCall(type, action = 'block', jids = null) {
	if (!['block', 'reject'].includes(action)) {
		throw new Error('Action must be either block or reject');
	}

	if (type === 'on') {
		jids = null;
	} else if (type === 'all') {
		if (!Array.isArray(jids) || !jids.every(jid => jid.length <= 4)) {
			throw new Error('All type requires array of country codes (max 4 chars)');
		}
	} else if (type === 'set') {
		if (!Array.isArray(jids) || !jids.every(jid => jid.length >= 11)) {
			throw new Error('Set type requires array of full phone numbers (min 11 chars)');
		}
	}

	await AntiCallDb.upsert({
		id: 1,
		on: true,
		type,
		action,
		jid: jids,
	});

	return true;
}

export async function delAntiCall() {
	const record = await AntiCallDb.findByPk(1);
	if (record) {
		record.on = false;
		await record.save();
	}
	return true;
}

export async function getAntiCall() {
	const record = await AntiCallDb.findByPk(1);
	if (!record) return null;

	return {
		on: record.on,
		type: record.type,
		action: record.action,
		jid: record.jid,
	};
}

export async function editSpecificAntiCall(type, action, newJids, removeJids = []) {
	const record = await AntiCallDb.findByPk(1);
	if (!record) {
		throw new Error('No AntiCall record found');
	}

	let currentJids = record.jid || [];

	if (type) record.type = type;
	if (action) record.action = action;

	if (Array.isArray(newJids)) {
		if (type === 'all' && !newJids.every(jid => jid.length <= 4)) {
			throw new Error('All type requires country codes (max 4 chars)');
		}
		if (type === 'set' && !newJids.every(jid => jid.length >= 11)) {
			throw new Error('Set type requires full numbers (min 11 chars)');
		}
		currentJids = [...new Set([...currentJids, ...newJids])];
	}

	if (Array.isArray(removeJids)) {
		currentJids = currentJids.filter(jid => !removeJids.includes(jid));
	}

	record.jid = type === 'on' ? null : currentJids;
	await record.save();

	return true;
}

export async function isJidInAntiCall(jid) {
	const record = await AntiCallDb.findByPk(1);
	if (!record || !record.on) return false;

	if (record.type === 'on') return true;

	if (record.type === 'all') {
		const countryCode = jid.slice(0, Math.min(jid.length, 4));
		return Array.isArray(record.jid) && record.jid.includes(countryCode);
	}

	if (record.type === 'set') {
		return Array.isArray(record.jid) && record.jid.includes(jid);
	}

	return false;
}

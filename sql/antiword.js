import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

const AntiWord = DATABASE.define(
	'Antiword',
	{
		jid: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		words: {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: [],
		},
		status: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: 'antiword',
		timestamps: false,
	},
);

/**
 * Enable or disable antiword functionality for a specific group
 * @param {string} jid - Group JID
 * @param {boolean} action - Enable (true) or disable (false) antiword
 * @returns {Promise<Object>} - Result of the operation
 */
async function setAntiWordStatus(jid, action) {
	if (!jid) return;
	const [record, created] = await AntiWord.findOrCreate({
		where: { jid },
		defaults: {
			jid,
			status: action,
			words: [],
		},
	});

	if (!created) {
		record.status = action;
		await record.save();
	}

	return {
		success: true,
		message: `Antiword ${
			action ? 'enabled' : 'disabled'
		} for group ${jid}`,
	};
}

/**
 * Add antiwords for a specific group
 * @param {string} jid - Group JID
 * @param {string[]} words - Array of words to block
 * @returns {Promise<Object>} - Result of the operation
 */
async function addAntiWords(jid, words) {
	if (!jid || !words) return;
	const [record, created] = await AntiWord.findOrCreate({
		where: { jid },
		defaults: {
			jid,
			status: false,
			words: words,
		},
	});

	if (!created) {
		// Remove duplicates and merge with existing words
		const uniqueWords = [...new Set([...record.words, ...words])];
		record.words = uniqueWords;
		await record.save();
	}

	return {
		success: true,
		message: `Added ${words.length} antiwords to group ${jid}`,
		addedWords: words,
	};
}

/**
 * Remove antiwords for a specific group
 * @param {string} jid - Group JID
 * @param {string[]} words - Array of words to remove
 * @returns {Promise<Object>} - Result of the operation
 */
async function removeAntiWords(jid, words) {
	if (!jid) return;
	const record = await AntiWord.findOne({ where: { jid } });

	if (!record) {
		return {
			success: false,
			message: `No antiwords found for group ${jid}`,
		};
	}

	// Remove specified words from the existing list
	record.words = record.words.filter(word => !words.includes(word));
	await record.save();

	return {
		success: true,
		message: `Removed ${words.length} antiwords from group ${jid}`,
		removedWords: words,
	};
}

/**
 * Get antiwords for a specific group
 * @param {string} jid - Group JID
 * @returns {Promise<Object>} - Antiwords and status for the group
 */
async function getAntiWords(jid) {
	if (!jid) return;
	const record = await AntiWord.findOne({ where: { jid } });

	if (!record) {
		return {
			success: true,
			status: false,
			words: [],
		};
	}

	return {
		success: true,
		status: record.status,
		words: record.words,
	};
}

/**
 * Check if antiword is enabled for a specific group
 * @param {string} jid - Group JID
 * @returns {Promise<boolean>} - True if enabled, false otherwise
 */
async function isAntiWordEnabled(jid) {
	if (!jid) return;
	const record = await AntiWord.findOne({ where: { jid } });
	return record ? record.status : false;
}

export {
	AntiWord,
	setAntiWordStatus,
	addAntiWords,
	removeAntiWords,
	getAntiWords,
	isAntiWordEnabled,
};

import { DATABASE } from '#lib';
import { DataTypes, Op } from 'sequelize';

export const FiltersDB = DATABASE.define(
	'filters',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		text: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		response: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		tableName: 'filters',
		timestamps: false,
		indexes: [
			{
				unique: true,
				fields: ['text'],
			},
		],
	},
);

/**
 * Adds a DM or GC filter to the database.
 * @param {string} type - The filter type ('dm' or 'gc')
 * @param {string} text - The trigger text for the filter.
 * @param {string} response - The response for the filter.
 * @returns {Promise<string>} - A success message.
 */
export async function addFilter(type, text, response) {
	try {
		const fullText = `${type}:${text}`;
		await FiltersDB.create({ text: fullText, response });
		return `${type.toUpperCase()} filter '${text}' added successfully.`;
	} catch (error) {
		if (error.name === 'SequelizeUniqueConstraintError') {
			return `${type.toUpperCase()} filter '${text}' already exists.`;
		}
		console.error('Filter addition error:', error);
		throw error;
	}
}

/**
 * Removes a filter from the database.
 * @param {string} type - The filter type ('dm' or 'gc')
 * @param {string} text - The trigger text of the filter to remove.
 * @returns {Promise<string>} - A success or failure message.
 */
export async function removeFilter(type, text) {
	const fullText = `${type}:${text}`;
	const rowsDeleted = await FiltersDB.destroy({
		where: { text: fullText },
	});
	return rowsDeleted ? `${type.toUpperCase()} filter '${text}' removed successfully.` : `${type.toUpperCase()} filter '${text}' does not exist.`;
}

/**
 * Retrieves filters by type from the database.
 * @param {string} type - The filter type ('dm' or 'gc')
 * @returns {Promise<Array<{ word: string, response: string }>>} - An array of filters.
 */
export async function getFilters(type) {
	const filters = await FiltersDB.findAll({
		where: {
			text: {
				[Op.like]: `${type}:%`,
			},
		},
	});
	return filters.map(filter => ({
		word: filter.text.replace(`${type}:`, ''),
		response: filter.response,
	}));
}



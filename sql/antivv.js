import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

const AntiVV = DATABASE.define(
	'AntiViewOnce',
	{
		type: {
			type: DataTypes.ENUM('all', 'dm', 'gc'),
			allowNull: false,
			defaultValue: 'all',
		},
		isEnabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: 'antiviewonce',
		timestamps: false,
	},
);

/**
 * Updates the view-once message protection setting in the database.
 * @param {boolean} status - The desired state of the view-once protection (true to enable, false to disable)
 * @returns {Promise<boolean>} A promise that resolves to true when the operation is complete
 * @async
 */
async function setViewOnce(status) {
	const [setting] = await AntiVV.findOrCreate({ where: {} });
	await setting.update({ isEnabled: status });
	return true;
}

/**
 * Checks if the ViewOnce feature is enabled in the system.
 * @async
 * @function isViewOnceEnabled
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if ViewOnce is enabled
 */
async function isViewOnceEnabled() {
	const [setting] = await AntiVV.findOrCreate({ where: {} });
	return setting.isEnabled;
}

/**
 * Updates or creates a view once type setting in the AntiVV database.
 * @param {string} type - The type of view once setting to be set.
 * @returns {Promise<boolean>} Returns true when the operation is successful.
 * @async
 */
async function setViewOnceType(type) {
	const [setting] = await AntiVV.findOrCreate({ where: {} });
	await setting.update({ type });
	return true;
}

/**
 * Retrieves or creates settings from the AntiVV database model
 * @async
 * @function getSettings
 * @returns {Promise<Object>} The settings object from the database
 * @description Finds the first record in the AntiVV table or creates one if none exists
 */
async function getSettings() {
	const [setting] = await AntiVV.findOrCreate({ where: {} });
	return setting;
}

export { AntiVV, setViewOnce, isViewOnceEnabled, setViewOnceType, getSettings };

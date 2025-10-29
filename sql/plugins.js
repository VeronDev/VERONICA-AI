import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const PluginDB = DATABASE.define(
	'PluginsDB',
	{
		name: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false,
		},
	},
	{
		timestamps: false,
		tableName: 'plugins',
	},
);

export async function addPlugin(name) {
	try {
		const newPlugin = await PluginDB.create({ name });
		return newPlugin;
	} catch (error) {
		console.error('Error adding plugin:', error);
		throw error;
	}
}

export async function updatePlugin(name, newName) {
	try {
		const [updated] = await PluginDB.update(
			{ name: newName },
			{
				where: { name },
			},
		);
		if (updated) {
			const updatedPlugin = await PluginDB.findOne({ where: { name: newName } });
			return updatedPlugin;
		}
		throw new Error('Plugin not found');
	} catch (error) {
		console.error('Error updating plugin:', error);
		throw error;
	}
}

export async function removePlugin(name) {
	try {
		const deleted = await PluginDB.destroy({
			where: { name },
		});
		return deleted;
	} catch (error) {
		console.error('Error removing plugin:', error);
		throw error;
	}
}

export async function getPlugins() {
	try {
		const plugins = await PluginDB.findAll();
		return plugins;
	} catch (error) {
		console.error('Error retrieving plugins:', error);
		throw error;
	}
}
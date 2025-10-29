import fs from 'fs';
import { join, basename, extname } from 'path';
import axios from 'axios';
import { addPlugin, getPlugins, removePlugin } from '#sql';

export async function installPlugin(pluginUrl) {
	const pluginName = `${basename(pluginUrl, extname(pluginUrl))}.js`;
	const existingPlugins = await getPlugins();

	if (existingPlugins.some(plugin => plugin.name === pluginName)) {
		throw new Error('Plugin already installed');
	}

	const pluginPath = join('plugins', pluginName);
	const response = await axios.get(pluginUrl, { responseType: 'arraybuffer' });
	fs.writeFileSync(pluginPath, response.data);
	await addPlugin(pluginName);

	return pluginName;
}

export async function removePluginByName(pluginName) {
	const deleted = await removePlugin(pluginName);

	if (!deleted) {
		return false;
	}

	const pluginPath = join('plugins', pluginName);
	if (fs.existsSync(pluginPath)) {
		fs.unlinkSync(pluginPath);
	}

	return true;
}

export async function listPlugins() {
	const plugins = await getPlugins();
	return plugins.map(plugin => plugin.name);
}

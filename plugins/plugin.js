import { bot } from '#lib';
import { extractUrlFromString } from '#lib';
import { installPlugin, removePluginByName, listPlugins } from '#utils';

bot(
	{
		pattern: 'install ?(.*)',
		public: false,
		desc: 'Installs a Plugin',
		type: 'plugins',
	},
	async (message, match) => {
		const pluginUrl = extractUrlFromString(match || message.reply_message?.text);
		if (!pluginUrl.startsWith('https://gist.githubusercontent.com')) return message.send('_Provide a valid Plugin URL_');

		try {
			const pluginName = await installPlugin(pluginUrl);
			message.send(`_${pluginName} plugin installed_`);
		} catch (error) {
			message.send(`_Error: ${error.message}_`);
		}
	},
);

bot(
	{
		pattern: 'delplugin ?(.*)',
		public: false,
		desc: 'Deletes a Plugin',
		type: 'plugins',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide an installed plugin name_');
		const pluginName = `${match.trim()}.js`;

		const removed = await removePluginByName(pluginName);
		if (removed) {
			message.send(`_${pluginName} plugin uninstalled_`);
		} else {
			message.send('_Plugin not found_');
		}
	},
);

bot(
	{
		pattern: 'getplugins',
		public: false,
		desc: 'Lists all installed plugins',
		type: 'plugins',
	},
	async message => {
		const plugins = await listPlugins();
		const pluginList = plugins.length > 0 ? `_Plugins Installed:_\n${plugins.join('\n')}` : '_No plugins installed_';
		message.send(pluginList);
	},
);

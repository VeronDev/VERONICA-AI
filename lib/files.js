import { pathToFileURL } from 'url';
import { join, extname } from 'path';
import { readdir } from 'fs/promises';

export async function loadPlugins() {
	const pluginsDir = join('plugins');

	const files = await readdir(pluginsDir, { withFileTypes: true });
	await Promise.all(
		files.map(async file => {
			const fullPath = join(pluginsDir, file.name);
			if (extname(file.name) === '.js') {
				try {
					const fileUrl = pathToFileURL(fullPath).href;
					await import(fileUrl);
				} catch (err) {
					console.log('ERROR', `${file.name}: ${err.message}`);
				}
			}
		}),
	);
	return console.log('Plugins Synced');
}

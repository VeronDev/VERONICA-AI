import fs from 'fs/promises';
const envPath = './.env';

export async function manageVar(params) {
	const { command, key, value } = params;

	async function readEnv() {
		try {
			let data = await fs.readFile(envPath, 'utf8');
			if (!data.trim()) {
				await fs.writeFile(envPath, '');
				data = '';
			}
			return data;
		} catch (error) {
			if (error.code === 'ENOENT') {
				await fs.writeFile(envPath, '');
				return '';
			}
			console.error('Error reading .env file:', error);
			throw error;
		}
	}

	if (command === 'set') {
		const envContent = await readEnv();
		const lines = envContent.split('\n').filter(Boolean); // Avoid empty lines
		const exists = lines.findIndex(line => line.startsWith(`${key}=`));

		if (exists !== -1) {
			lines[exists] = `${key}=${value}`;
		} else {
			lines.push(`${key}=${value}`);
		}

		await fs.writeFile(envPath, lines.join('\n') + '\n');
		return true;
	} else if (command === 'get') {
		const data = await readEnv();
		return data || null;
	} else if (command === 'del') {
		const data = await readEnv();
		const lines = data
			.split('\n')
			.filter(line => line.trim() && !line.startsWith(`${key}=`))
			.join('\n');

		await fs.writeFile(envPath, lines + '\n');
		return true;
	}
}

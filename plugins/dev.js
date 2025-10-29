import { bot } from '#lib';
import { isSudo } from '#sql';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Store imported modules in memory
const importCache = new Map();

bot(
	{
		on: 'text',
		dontAddCommandList: true
	},
	async (message, match, _, client) => {
		if (
			!message.text ||
			!message.text.startsWith('$ ') ||
			!(await isSudo(message.sender, message.user))
		)
			return;

		let code = message.text.slice(2).trim().replace(/\$\s*/g, '');

		if (code === 'require') {
			return await message.send(
				`*Info:*\n\`\`\`Usage: require('module-name')\nExample: require('fs')\`\`\``
			);
		}
		if (code === 'import') {
			return await message.send(
				`*Info:*\n\`\`\`Usage: await import('module-name')\nExample: await import('fs')\`\`\``
			);
		}

		try {
			let importedModules = {};
			if (code.startsWith('import')) {
				const lines = code.split('\n');
				const importLines = [];
				const otherLines = [];

				for (const line of lines) {
					if (line.trim().startsWith('import')) {
						importLines.push(line);
					} else {
						otherLines.push(line);
					}
				}

				for (const importLine of importLines) {
					const match = importLine.match(/import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/);
					if (match) {
						const [_, imports, modulePath] = match;
						const moduleNames = imports.split(',').map(name => name.trim());

						let importedModule;
						if (importCache.has(modulePath)) {
							importedModule = importCache.get(modulePath);
						} else {
							importedModule = await import(modulePath);
							importCache.set(modulePath, importedModule);
						}

						for (const name of moduleNames) {
							importedModules[name] = importedModule[name];
						}
					}
				}

				code = otherLines.join('\n');
			}

			const evalContext = {
				...importedModules,
				message,
				client,
				require,
				__dirname,
				__filename,
				process,
				Buffer,
				console,
				async dynamicImport(modulePath) {
					if (typeof modulePath !== 'string') throw new Error('Module path must be a string');
					if (importCache.has(modulePath)) return importCache.get(modulePath);
					const module = await import(modulePath);
					importCache.set(modulePath, module);
					return module;
				}
			};

			const wrappedCode = `
                with (context) {
                    return (async () => {
                        ${code}
                    })();
                }
            `;

			const evaluator = new Function('context', wrappedCode);
			const result = await evaluator(evalContext);

			const getStringValue = value => {
				if (value === undefined) return 'undefined';
				if (value === null) return 'null';
				if (typeof value === 'function') return value.toString();
				if (typeof value === 'object') return `[${value.constructor.name}]`;
				return String(value);
			};

			let output;
			try {
				const seen = new WeakSet();
				output = JSON.stringify(
					result,
					(key, value) => {
						if (typeof value === 'object' && value !== null) {
							if (seen.has(value)) return '[Circular]';
							seen.add(value);
						}
						return value === undefined ? 'undefined' : value;
					},
					2
				);
			} catch {
				output = getStringValue(result);
			}

			return await message.send(`*Result:*\n\`\`\`${output}\`\`\``, {
				type: 'text'
			});
		} catch (error) {
			await message.send(`*Error:*\n\`\`\`${error.stack || error.message || String(error)}\`\`\``);
		}
	}
);

bot(
	{
		pattern: 'eval ?(.*)',
		public: false,
		desc: 'Evaluate code',
		type: 'system'
	},
	async (message, match) => {
		const src_code = match || message.reply_message?.text;
		if (!src_code) return message.send('_Provide code to evaluate_');
		const code = src_code.trim().replace(/\$\s*/g, '');
		try {
			const result = await eval(`(async () => { ${code} })()`);
			const output =
				result === undefined
					? 'undefined'
					: result === null
					? 'null'
					: typeof result === 'function'
					? result.toString()
					: JSON.stringify(
							result,
							(key, value) => {
								if (value === undefined) return 'undefined';
								if (value === null) return 'null';
								if (typeof value === 'function') return value.toString();
								return value;
							},
							2
					  );

			return await message.send(`*Result:*\n\`\`\`${output}\`\`\``, {
				type: 'text'
			});
		} catch (error) {
			const errorMessage = error.stack || error.message || String(error);
			await message.send(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
		}
	}
);

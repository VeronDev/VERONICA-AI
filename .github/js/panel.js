import { existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const CONFIG = {
	SESSION_ID: '', // Put your Session ID
	PROJECT_DIR: 'VERONICA-AI',
	REPO_URL: 'https://github.com/VeronDev/VERONICA-AI.git',
	APP_NAME: 'Veronica',
	MAIN_SCRIPT: 'index.js',
};

function handleError(message, error) {
	console.error(message, error);
	process.exit(1);
}

function cloneRepository() {
	console.log('Cloning repository...');
	const cloneResult = spawnSync('git', ['clone', CONFIG.REPO_URL, CONFIG.PROJECT_DIR], {
		stdio: 'inherit',
		shell: true,
	});
	if (cloneResult.error || cloneResult.status !== 0) {
		handleError('Failed to clone repository.', cloneResult.error);
	}
}

function writeEnvFile() {
	try {
		writeFileSync(join(CONFIG.PROJECT_DIR, '.env'), `SESSION_ID=${CONFIG.SESSION_ID}`);
	} catch (error) {
		handleError('Failed to write .env file', error);
	}
}

function installDependencies() {
	console.log('Installing dependencies...');
	const installResult = spawnSync('yarn', ['install'], {
		cwd: resolve(CONFIG.PROJECT_DIR),
		stdio: 'inherit',
		shell: true,
	});
	if (installResult.error || installResult.status !== 0) {
		handleError('Failed to install dependencies.', installResult.error);
	}
}

function startApplication() {
	console.log('Starting application...');
	const startResult = spawnSync('pm2', ['start', CONFIG.MAIN_SCRIPT, '--name', CONFIG.APP_NAME, '--attach'], {
		cwd: resolve(CONFIG.PROJECT_DIR),
		stdio: 'inherit',
		shell: true,
	});

	if (startResult.error || startResult.status !== 0) {
		console.error('PM2 start failed. Falling back to Node.js.');
		const nodeResult = spawnSync('node', [CONFIG.MAIN_SCRIPT], {
			cwd: resolve(CONFIG.PROJECT_DIR),
			stdio: 'inherit',
			shell: true,
		});
		if (nodeResult.error || nodeResult.status !== 0) {
			handleError('Failed to start the application with Node.js.', nodeResult.error);
		}
	}
}

function VeroPanel() {
	if (!existsSync(CONFIG.PROJECT_DIR)) cloneRepository();
	writeEnvFile();
	installDependencies();
	startApplication();
}

VeroPanel();

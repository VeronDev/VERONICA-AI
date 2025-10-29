import { config } from 'dotenv';
import { DATABASE } from '#database';
import { client, eventlogger, initSession, loadPlugins, sessionData } from '#lib';
import cluster from 'cluster';

config();

if (cluster.isMaster) {
	let isRestarting = false;

	const createWorker = () => {
		const worker = cluster.fork();

		worker.on('message', message => {
			if (message === 'app.kill') {
				console.log('Shutting down Veronica...');
				worker.kill();
				process.exit(0);
			} else if (message === 'restart') {
				console.log('Restarting...');
				isRestarting = true;
				worker.kill();
			}
		});

		worker.on('exit', () => {
			if (!isRestarting) console.log('Restarting...');
			isRestarting = false;
			createWorker();
		});
	};

	createWorker();

	['SIGINT', 'SIGTERM'].forEach(sig => {
		process.on(sig, () => {
			for (const id in cluster.workers) {
				cluster.workers[id].kill();
			}
			process.exit(0);
		});
	});
} else {
	const startServer = async () => {
		console.log('Starting...');
		await DATABASE.sync();
		eventlogger();
		initSession(sessionData);
		await loadPlugins();
		await client();
	};

	startServer();
	process.on('unhandledRejection', () => {});
	process.on('exit', () => process.send('restart'));
}
import {
	makeWASocket,
	fetchLatestBaileysVersion,
	makeCacheableSignalKeyStore,
	DisconnectReason,
	Browsers,
	useMultiFileAuthState,
	isJidBroadcast
} from 'baileys';
import { ProxyAgent } from 'proxy-agent';
import { EventEmitter } from 'events';
import Message from './class.js';
import { proxy, manageProcess } from '#utils';
import { AntiCall, AntiDelete, Greetings, GroupEventPartial, GroupEvents } from '#bot';
import { loadMessage, saveMessage, getGroupMetadata, getName } from '#sql';
import { getConfigValues, upserts, Plugins, serialize, logger } from '#lib';

EventEmitter.defaultMaxListeners = 2000;
process.setMaxListeners(2000);

export const client = async () => {
	const session = await useMultiFileAuthState('./session');
	const { state, saveCreds } = session;
	
	let waVersion;
	try {
		const { version } = await fetchLatestBaileysVersion();
		waVersion = version;
		console.log(`[✅] Using Baileys version: ${JSON.stringify(waVersion)}`);
	} catch (error) {
		console.log(`[⚠️] Failed to fetch latest version, using default`);
		waVersion = [2, 3000, 1017546695];
	}

	const conn = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger)
		},
		printQRInTerminal: true,
		logger,
		agent: new ProxyAgent(`http://${await proxy()}`),
		browser: Browsers.windows('Desktop'),
		version: waVersion,
		keepAliveIntervalMs: 5000,
		syncFullHistory: true,
		defaultQueryTimeoutMs: 30000,
		retryRequestDelayMs: 5000,
		markOnlineOnConnect: false,
		fireInitQueries: true,
		emitOwnEvents: true,
		generateHighQualityLinkPreview: true,
		getMessage: async key => {
			const store = await loadMessage(key.id);
			return store ? store : { conversation: null };
		},
		cachedGroupMetadata: async jid => {
			const store = await getGroupMetadata(jid);
			return store || null;
		}
	});

	conn.ev.on('call', async calls => {
		await AntiCall(calls, conn);
	});

	conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		switch (connection) {
			case 'connecting':
				console.log('Connecting...');
				break;

			case 'close':
				lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut
					? manageProcess()
					: client();
				break;

			case 'open':
				const vInfo = waVersion.join('.');
				await conn.sendMessage(conn.user.id, { text: `\`\`\`Bot Connected\n${vInfo}\`\`\`` });
				console.log(`Bot Connected 💚 Wa Version: ${vInfo}`);
				break;
		}
	});

	conn.ev.on('creds.update', saveCreds);

	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type !== 'notify') return;

		const { autoRead, autoStatusRead, autolikestatus } = await getConfigValues();

		for (const message of messages) {
			const msg = await serialize(JSON.parse(JSON.stringify(message, null, 2)), conn);
			if (autoRead) await conn.readMessages([msg.key]);
			if (autoStatusRead && isJidBroadcast(msg.from)) await conn.readMessages([message.key]);
			if (autolikestatus && isJidBroadcast(msg.from)) {
				await conn.sendMessage(
					msg.from,
					{ react: { key: message.key, text: '💚' } },
					{ statusJidList: [message.key.participant, conn.user.id] }
				);
			}
			await Promise.all([
				Plugins(msg, conn, new Message(conn, msg)),
				saveMessage(msg),
				upserts(msg)
			]);
		}
	});

	conn.ev.on('messages.update', async updates => {
		await AntiDelete(conn, updates);
	});

	conn.ev.on('group-participants.update', async ({ id, participants, action, author }) => {
		if ((await getConfigValues()).disablegc) return;
		const event = { Group: id, participants: participants, action: action, by: author };
		await Promise.all([Greetings(event, conn), GroupEvents(event, conn)]);
	});

	conn.ev.on('groups.update', async updates => {
		if ((await getConfigValues()).disablegc) return;
		for (const update of updates) {
			await GroupEventPartial(update, conn);
		}
	});

	conn.loadMessage = loadMessage.bind(conn);
	conn.getName = getName.bind(conn);

	return conn;
};

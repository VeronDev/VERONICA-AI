import {
	Antilink,
	AntiSpammer,
	AntiViewOnce,
	AntiWord,
	AutoKick,
	schedules,
	updateGroupMetadata,
	StickerCMD
} from '#bot';
import { config } from '#config';
import { readFile } from 'fs/promises';
import { getConfig } from '#sql';
import { getJson } from '#lib';
import { MessagesDebug } from './debug.js';
import { isJidGroup } from 'baileys';

export async function getConfigValues() {
	const db_list = await getConfig();
	const {
		autoRead,
		autoStatusRead,
		cmdReact,
		cmdRead,
		mode,
		PREFIX,
		autolikestatus,
		disablegc,
		disabledm
	} = db_list;
	return {
		autoRead,
		autoStatusRead,
		cmdReact,
		cmdRead,
		mode,
		PREFIX,
		autolikestatus,
		disablegc,
		disabledm
	};
}

export async function getUsers() {
	return await getJson(`${config.API_ID}/api/users`);
}

export async function upserts(msg) {
	let tasks = [];
	const configValues = await getConfigValues();
	if (!msg.isGroup) {
		if (configValues.disabledm && msg.from !== msg.user) return; 
		tasks.push(
			AntiSpammer(msg),
			AntiViewOnce(msg),
			updateGroupMetadata(msg),
			MessagesDebug(msg),
			StickerCMD(msg)
		);
	}
	if (msg.isGroup) {
		if (isJidGroup(msg.from) && configValues.disablegc) return; 
		tasks.push(Antilink(msg), schedules(msg), AntiWord(msg), AutoKick(msg));
	}
	await Promise.all(tasks);
}

export const logo = await readFile('./media/vero.jpg');
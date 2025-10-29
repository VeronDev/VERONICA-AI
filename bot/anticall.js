import { getAntiCall, isSudo } from '#sql';
import { toJid } from '#utils';
import { delay } from 'baileys';

export const AntiCall = async (calls, client) => {
	for (const call of calls) {
		const { id, from: caller, status: whyCalled, date: timeCalled, isGroup } = call;

		if (isGroup) continue; // Ignore group calls
		if (await isSudo(caller)) continue; // Ignore sudo users

		const antiCallConfig = await getAntiCall();
		if (!antiCallConfig.on) return; // Exit if AntiCall is disabled

		// Basic AntiCall Settings
		if (antiCallConfig.type === 'on' && whyCalled === 'offer') {
			await client.rejectCall(id, caller);

			if (antiCallConfig.action === 'block') {
				await client.sendMessage(caller, { text: '```You have been blocked for Calling```' });
				await delay(3000);
				return client.updateBlockStatus(caller, 'block');
			}

			return client.sendMessage(caller, { text: '```Your Call has been Automatically Declined, No Calls Allowed```' });
		}

		// Handling Specific Users
		if (antiCallConfig.type === 'set' && whyCalled === 'offer') {
			const bannedUsers = antiCallConfig.jid.map(jid => toJid(jid));
			if (bannedUsers.includes(caller)) {
				await client.rejectCall(id, caller);
				if (antiCallConfig.action === 'block') {
					await client.sendMessage(caller, { text: '```You have been blocked for Calling```' });
					await delay(3000);
					return client.updateBlockStatus(caller, 'block');
				}
				return client.sendMessage(caller, { text: '```Your Call has been Automatically Declined, No Calls Allowed```' });
			}
		}

		if (antiCallConfig.type === 'all' && whyCalled === 'offer') {
			const bannedCountryCodes = antiCallConfig.jid; // Assuming this is an array of country codes
			const callerNumber = caller.split('@')[0]; 
			const isBannedCountry = bannedCountryCodes.some(code => callerNumber.startsWith(code));

			if (isBannedCountry) {
				await client.rejectCall(id, caller);

				if (antiCallConfig.action === 'block') {
					await client.sendMessage(caller, { text: '```You have been blocked for Calling```' });
					await delay(3000);
					return client.updateBlockStatus(caller, 'block');
				}

				return client.sendMessage(caller, { text: '```Your Call has been Automatically Declined, No Calls Allowed```' });
			}
		}
	}
};

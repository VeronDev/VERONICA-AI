import { bot } from '#lib';
import { addAntiCall, editSpecificAntiCall, getAntiCall, isJidInAntiCall } from '#sql';

bot(
	{
		pattern: 'anticall',
		public: false,
		desc: 'Setup Anticall',
		type: 'user'
	},
	async (message, match, { prefix, pushName }) => {
		const anticallConfig = (await getAntiCall()) || {
			on: false,
			action: 'reject',
			jid: [],
			type: null
		};

		if (!match) {
			return message.send(
				`
*AntiCall Setup:*

_${prefix}anticall on_
_Turns on AntiCall and will Automatically Reject or Block Calls from anyone._

_${prefix}anticall all,234,91,254_
_Specifies country codes for AntiCall to Automatically Reject or Block Calls starting with those codes._

_${prefix}anticall set,234803456789,123456789_
_Sets specific numbers for AntiCall to Reject or Block Calls from._

_${prefix}anticall action,block | reject_
_Chooses whether to Block the caller or just Reject their Call._`
			);
		}

		match = match.split(',');
		const mode = match[0];

		if (mode === 'on') {
			if (anticallConfig.on) return message.send('_AntiCall is already enabled._');
			await addAntiCall('on', anticallConfig.action || 'reject');
			return message.send('_AntiCall is now active_');
		}

		if (mode === 'action') {
			const newAction = match[1]?.trim();
			if (!['block', 'reject'].includes(newAction))
				return message.send('_Invalid action. Use "block" or "reject"._');
			if (newAction === anticallConfig.action) return message.send(`_Already Set to ${newAction}_`);
			await editSpecificAntiCall(null, newAction, null, null);
			return message.send(`_AntiCall action updated to "${newAction}"._`);
		}

		if (mode === 'set') {
			const numbersToCheck = match.slice(1);
			const numbersToAdd = [];

			for (let num of numbersToCheck) {
				const doesExist = await isJidInAntiCall(num);
				if (!doesExist) numbersToAdd.push(num);
			}

			if (numbersToAdd.length > 0) {
				await editSpecificAntiCall(null, null, numbersToAdd);
				return message.send(
					`_${numbersToAdd.length} number(s) has been added to list to Reject Calls._`
				);
			} else {
				await addAntiCall(mode, anticallConfig.type, match.slice(1));
				return message.send('_AntiCall for Specific Numbers Set_');
			}
		}

		if (mode === 'all') {
			const countryCodes = match
				.slice(1)
				.map(code => code.trim())
				.filter(code => code.length > 0 && code.length <= 4); // Ensures codes are not longer than 4 characters
			const uniqueCountryCodes = [...new Set(countryCodes)];

			if (uniqueCountryCodes.length > 0) {
				await addAntiCall('all', anticallConfig.action, uniqueCountryCodes);
				return message.send(`_AntiCall is now set to handle calls from the specified countries._`);
			}
			return message.send(
				'_No valid country codes provided. Ensure codes do not exceed 4 characters._'
			);
		}

		return message.send(
			`\`\`\`${pushName} that's invaild, use ${prefix}anticall to see help\`\`\``
		);
	}
);

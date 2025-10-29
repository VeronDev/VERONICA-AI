import { bot } from '#lib';
bot(
	{
		pattern: 'privacy',
		public: false,
		desc: 'View your privacy settings',
		type: 'privacy'
	},
	async message => {
		const settings = await message.client.fetchPrivacySettings(true);
		const name = await message.client.getName(message.user);

		const mapPrivacyValue = (value, type) => {
			const mappings = {
				all: 'Everyone',
				contacts: 'Your contacts',
				contact_blacklist: 'Your contacts except blocked',
				none: 'No one',
				match_last_seen: 'Matches Last Seen',
				known: 'Known contacts'
			};
			return mappings[value] || value;
		};

		const userPrivacy = {
			'Read Receipts': mapPrivacyValue(settings.readreceipts),
			'Profile Photo': mapPrivacyValue(settings.profile),
			'Status Updates': mapPrivacyValue(settings.status),
			'Online Status': mapPrivacyValue(settings.online, 'online'),
			'Last Seen': mapPrivacyValue(settings.last),
			'Group Add': mapPrivacyValue(settings.groupadd, 'groupadd'),
			'Call Add': mapPrivacyValue(settings.calladd, 'call'),
			Messages: mapPrivacyValue(settings.messages)
		};

		const privacyText = Object.entries(userPrivacy)
			.map(([key, value]) => `${key}: ${value}`)
			.join('\n');

		return await message.send(`\`\`\`${name} WhatsApp Privacy Settings\n\n${privacyText}\`\`\``);
	}
);

bot(
	{
		pattern: 'setcall',
		public: false,
		desc: 'Update call privacy settings',
		type: 'privacy'
	},
	async (message, match) => {
		const value = match.trim();
		if (!['all', 'known'].includes(value)) {
			return await message.send('_Invalid settings! Use "all" or "known"_');
		}
		await message.client.updateCallPrivacy(value);
		return await message.send(
			`_Call privacy updated to: ${value === 'all' ? 'Everyone' : 'Known contacts'}_`
		);
	}
);

bot(
	{
		pattern: 'setseen',
		public: false,
		desc: 'Update last seen privacy settings',
		type: 'privacy'
	},
	async (message, match) => {
		const value = match.trim();
		if (!['all', 'contacts', 'contact_blacklist', 'none'].includes(value)) {
			return await message.send(
				'_Invalid settings Use "all", "contacts", "contact_blacklist", or "none"_'
			);
		}
		await message.client.updateLastSeenPrivacy(value);
		return await message.send(`_Last seen privacy updated to: ${value}_`);
	}
);

bot(
	{
		pattern: 'setonline',
		public: false,
		desc: 'Update online privacy settings',
		type: 'privacy'
	},
	async (message, match) => {
		const value = match.trim();
		if (!['all', 'match_last_seen'].includes(value)) {
			return await message.send('_Invalid value. Use "all" or "match_last_seen"_');
		}
		await message.client.updateOnlinePrivacy(value);
		return await message.send(`_Online privacy updated to: ${value}_`);
	}
);

bot(
	{
		pattern: 'ppset',
		public: false,
		desc: 'Update profile picture privacy settings',
		type: 'privacy'
	},
	async (message, match) => {
		const value = match.trim();
		if (!['all', 'contacts', 'contact_blacklist', 'none'].includes(value)) {
			return await message.send(
				'_Invalid settings Use "all", "contacts", "contact_blacklist", or "none"._'
			);
		}
		await message.client.updateProfilePicturePrivacy(value);
		return await message.send(`_Profile picture privacy updated to: ${value}_`);
	}
);

bot(
	{
		pattern: 'setstatus',
		public: false,
		desc: 'Update status privacy settings',
		type: 'privacy'
	},
	async (message, match) => {
		const value = match.trim();
		if (!['all', 'contacts', 'contact_blacklist', 'none'].includes(value)) {
			return await message.send(
				'_Invalid settings Use "all", "contacts", "contact_blacklist", or "none"._'
			);
		}
		await message.client.updateStatusPrivacy(value);
		return await message.send(`_Status privacy updated to: ${value}_`);
	}
);

bot(
	{
		pattern: 'setrr',
		public: false,
		desc: 'Update read receipts privacy settings',
		type: 'privacy'
	},
	async (message, match) => {
		const value = match.trim();
		if (!['all', 'none'].includes(value)) {
			return await message.send('_Invalid value. Use "all" or "none"._');
		}
		await message.client.updateReadReceiptsPrivacy(value);
		return await message.send(
			`_Read receipts privacy updated to: ${value === 'all' ? 'Everyone' : 'No one'}_`
		);
	}
);

bot(
	{
		pattern: 'groupadd',
		public: false,
		desc: 'Update group add privacy settings',
		type: 'privacy'
	},
	async (message, match) => {
		const value = match.trim();
		if (!['all', 'contacts', 'contact_blacklist'].includes(value)) {
			return await message.send('_Invalid value. Use "all", "contacts", or "contact_blacklist"._');
		}
		await message.client.updateGroupsAddPrivacy(value);
		return await message.send(`_Group add privacy updated to: ${value}_`);
	}
);

bot(
	{
		pattern: 'disappear',
		public: false,
		desc: 'Update default disappearing messages duration',
		type: 'privacy'
	},
	async (message, match) => {
		const durations = {
			'24hrs': 24 * 3600, // 24 hours
			'7days': 7 * 24 * 3600, // 7 days
			'90days': 90 * 24 * 3600 // 90 days
		};
		const input = match.trim().toLowerCase();
		if (!durations[input]) {
			return await message.send(
				'_To use disappering message, "24hrs", "7days", or "90days" to set the time_'
			);
		}
		const durationInSeconds = durations[input];
		await message.client.updateDefaultDisappearingMode(durationInSeconds);
		return await message.send(
			`\`\`\`Default disappearing mode updated to: ${input
				.replace('hrs', ' hours')
				.replace('days', ' days')}\`\`\``
		);
	}
);

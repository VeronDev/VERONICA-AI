import { bot } from '#lib';
import { delay } from 'baileys';
import { toJid } from '#utils';
import { disableGroupEvents, enableGroupEvents, isGroupEventEnabled } from '#sql';

bot(
	{
		pattern: 'act',
		public: true,
		isGroup: true,
		desc: 'Act Various Events for Group Such as Demote/Promote/Modify',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		if (await isGroupEventEnabled(message.jid))
			return message.send(`_Group Events Already Enabled_`);
		await enableGroupEvents(message.jid);
		message.send(`_Group Events Activated_`);
	}
);

bot(
	{
		pattern: 'deact',
		public: true,
		isGroup: true,
		desc: 'Disable Various Events for Group Such as Demote/Promote/Modify',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		if (!(await isGroupEventEnabled(message.jid)))
			return message.send(`_Group Events Already Disabled_`);
		await disableGroupEvents(message.jid);
		message.send(`_Group Events Deactivated_`);
	}
);

bot(
	{
		pattern: 'joinapprove',
		public: true,
		isGroup: true,
		desc: 'Set up groupJoinApprovalMode',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		if (!['on', 'off'].includes(match))
			return message.send('_Use on | off to configure how new members can join the group_');
		await message.client.groupJoinApprovalMode(message.jid, match);
		return message.send(`\`\`\`GroupJoinApprovalMode is now set to: ${match.toUpperCase()}\`\`\``);
	}
);

bot(
	{
		pattern: 'memberadd',
		public: true,
		isGroup: true,
		desc: 'Set who can add new members to the group',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		if (!['on', 'off'].includes(match))
			return message.send('_Use on | off to configure who can add members to the group_');
		const mode = match === 'on' ? 'all_member_add' : 'admin_add';
		await message.client.groupMemberAddMode(message.jid, mode);
		return message.send(`\`\`\`GroupMemberAddMode is now set to: ${mode.toUpperCase()}\`\`\``);
	}
);

bot(
	{
		pattern: 'ckick',
		public: false,
		isGroup: true,
		desc: 'Kick a certain country code from a group',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		const countryCode = match?.trim().replace('+', '');
		if (!countryCode || isNaN(countryCode))
			return message.send('_Please provide a valid country code._');
		const metadata = await message.client.groupMetadata(message.jid);
		const participants = metadata.participants;
		const toKick = participants
			.filter(participant => participant.id.startsWith(`${countryCode}`) && !participant.admin)
			.map(participant => participant.id);
		if (!toKick.length)
			return message.send(`_No members found with the country code ${countryCode}._`);
		for (const jid of toKick) {
			await message.client.groupParticipantsUpdate(message.jid, [jid], 'remove');
			await message.send(`_Kicked member:_ @${jid.split('@')[0]}`, {
				mentions: [jid]
			});
			await delay(2000);
		}
		await message.send(`_Kicked All Memeber from ${countryCode}._`);
	}
);

bot(
	{
		pattern: 'gname',
		public: true,
		isGroup: true,
		desc: 'Change Group Name',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		const subject = match || message.reply_message?.text;
		if (!subject) return message.send('_Provide A New Name for the Group!_');
		await message.client.groupUpdateSubject(message.jid, subject);
		return message.send('_Group Name Updated_');
	}
);

bot(
	{
		pattern: 'gdesc ?(.*)',
		public: true,
		isGroup: true,
		desc: 'Changes Group Description',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		const desciption = match || message.reply_message?.text;
		if (!desciption) return message.send('_please add a new group description_')
		await message.client.groupUpdateDescription(message.jid, desciption);
		return message.send('_Group Description Updated_');
	}
);

bot(
	{
		pattern: 'promote',
		public: true,
		isGroup: true,
		desc: 'Promotes Someone to Admin',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		const jid = await message.getUserJid(match);
		const groupMetadata = await message.client.groupMetadata(message.jid);
		const participant = groupMetadata.participants.find(p => p.id === jid);
		if (participant.admin)
			return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is already an admin._`, {
				mentions: [jid]
			});
		await message.client.groupParticipantsUpdate(message.jid, [jid], 'promote');
		return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is now an admin_`, {
			mentions: [jid]
		});
	}
);

bot(
	{
		pattern: 'demote',
		public: true,
		isGroup: true,
		desc: 'Demotes Someone from Admin',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		const jid = await message.getUserJid(match);
		const groupMetadata = await message.client.groupMetadata(message.jid);
		const participant = groupMetadata.participants.find(p => p.id === jid);
		if (!participant.admin)
			return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is not an admin._`, {
				mentions: [jid]
			});
		await message.client.groupParticipantsUpdate(message.jid, [jid], 'demote');
		return message.send(`_@${jid.replace('@s.whatsapp.net', '')} is no longer an admin_`, {
			mentions: [jid]
		});
	}
);

bot(
	{
		pattern: 'kick ?(.*)',
		public: false,
		isGroup: true,
		desc: 'Kicks A Participant from Group',
		type: 'group'
	},
	async (message, match) => {
		if (!(await message.isUserAdmin())) return;
		const jid = await message.getUserJid(match);
		if (!jid) return message.send('_Reply, tag, or give me the participant number_');
		await message.client.groupParticipantsUpdate(message.jid, [jid], 'remove');
		return message.send(`_@${jid.split('@')[0]} has been kicked!_`, {
			mentions: [jid]
		});
	}
);

bot(
	{
		pattern: 'invite',
		public: true,
		isGroup: true,
		desc: 'Get Group Invite link',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		const msg = await message.send('*wait*');
		const code = await message.client.groupInviteCode(message.jid);
		return msg.edit(`https://chat.whatsapp.com/${code}`);
	}
);

bot(
	{
		pattern: 'leave',
		public: false,
		isGroup: true,
		desc: 'leave a group',
		type: 'group'
	},
	async message => {
		await message.send('_Left Group_');
		await delay(2000);
		return message.client.groupParticipantsUpdate(message.jid, [message.user], 'remove');
	}
);

bot(
	{
		pattern: 'poll',
		public: true,
		isGroup: true,
		desc: 'Creates a poll in the group.',
		type: 'group'
	},
	async (message, match) => {
		let [pollName, pollOptions] = match.split(';');
		if (!pollOptions)
			return await message.send(message.prefix + 'poll question;option1,option2,option3.....');
		let options = [];
		for (let option of pollOptions.split(','))
			if (option && option.trim() !== '') options.push(option.trim());
		await message.client.sendMessage(message.jid, {
			poll: {
				name: pollName,
				values: options,
				selectableCount: 1
			}
		});
	}
);

bot(
	{
		pattern: 'mute',
		public: true,
		isGroup: true,
		desc: 'Mute a group (admins only)',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		const metadata = await message.client.groupMetadata(message.jid);
		if (metadata.announce)
			return message.send('_Group is already muted. Only admins can send messages._');
		await message.client.groupSettingUpdate(message.jid, 'announcement');
		await message.send('_Group has been muted. Only admins can send messages now._');
	}
);

bot(
	{
		pattern: 'unmute',
		public: true,
		isGroup: true,
		desc: 'Unmute a group (admins only)',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		const metadata = await message.client.groupMetadata(message.jid);
		if (!metadata.announce)
			return message.send('_Group is already unmuted. All members can send messages._');
		await message.client.groupSettingUpdate(message.jid, 'not_announcement');
		await message.send('_Group has been unmuted. All members can send messages now._');
	}
);

bot(
	{
		pattern: 'tagadmin',
		public: false,
		isGroup: true,
		desc: 'Tags Admins of A Group',
		type: 'group'
	},
	async message => {
		const groupMetadata = await message.client.groupMetadata(message.jid);
		const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
		if (groupAdmins.length > 0) {
			const adminTags = groupAdmins.map(admin => `@${admin.split('@')[0]}`);
			const replyText = `*_Group Admins:_*\n ${adminTags.join('\n')}`;
			await message.send(replyText, { mentions: groupAdmins });
		} else {
			await message.send('_No admins found._');
		}
	}
);

bot(
	{
		pattern: 'revoke',
		public: true,
		isGroup: true,
		desc: 'Revoke Invite link',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		await message.client.groupRevokeInvite(message.jid);
		return message.send('_Group Link Revoked!_');
	}
);

bot(
	{
		pattern: 'gpp',
		public: false,
		isGroup: true,
		desc: 'Changes Group Profile Picture',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		if (!message.reply_message?.image) return message.send('_Reply An Image!_');
		const img = await message.download();
		await message.client.updateProfilePicture(message.jid, img);
		return await message.send('_Group Image Updated_');
	}
);

bot(
	{
		pattern: 'lock',
		public: true,
		isGroup: true,
		desc: 'Lock groups settings',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		const meta = await message.client.groupMetadata(message.jid);
		if (meta.restrict) return message.send('_Group is already locked to Admins._');
		await message.client.groupSettingUpdate(message.jid, 'locked');
		return message.send('_Group has been locked to Admins_');
	}
);

bot(
	{
		pattern: 'unlock',
		public: true,
		isGroup: true,
		desc: 'Unlock groups settings',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		const meta = await message.client.groupMetadata(message.jid);
		if (!meta.restrict) return message.send('_Group is already unlocked for participants._');
		await message.client.groupSettingUpdate(message.jid, 'unlocked');
		return message.send('_Group is now unlocked for participants._');
	}
);

bot(
	{
		pattern: 'requests',
		public: true,
		isGroup: true,
		desc: 'Shows the pending requests of the group',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		const joinRequests = await message.client.groupRequestParticipantsList(message.jid);
		if (!joinRequests || !joinRequests[0]) return await message.send('_No Join Requests_');
		let requestList = '*_Group Join Requets List_*\n\n';
		let requestJids = [];
		for (let request of joinRequests) {
			requestList += `@${request.jid.split('@')[0]}\n`;
			requestJids.push(request.jid);
		}
		await message.send(requestList, { mentions: requestJids });
	}
);

bot(
	{
		pattern: 'acceptall',
		public: true,
		isGroup: true,
		desc: 'Accept all join requests',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;

		const joinRequests = await message.client.groupRequestParticipantsList(message.jid);
		if (!joinRequests || !joinRequests[0]) return await message.send('_No Requests Found!_');
		let acceptedUsers = [];
		let acceptanceList = '*_Accepted Users_*\n\n';
		for (let request of joinRequests) {
			await message.client.groupRequestParticipantsUpdate(message.jid, [request.jid], 'approve');
			acceptanceList += `@${request.jid.split('@')[0]}\n`;
			acceptedUsers.push(request.jid);
		}
		await message.send(acceptanceList, { mentions: acceptedUsers });
	}
);

bot(
	{
		pattern: 'rejectall',
		public: true,
		isGroup: true,
		desc: 'Reject all join requests',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		const joinRequests = await message.client.groupRequestParticipantsList(message.jid);
		if (!joinRequests || !joinRequests[0]) return await message.send('_No Requests Found!_');
		let rejectedUsers = [];
		let rejectionList = '*_Rejected Users_*\n\n';
		for (let request of joinRequests) {
			await message.client.groupRequestParticipantsUpdate(message.jid, [request.jid], 'reject');
			rejectionList += `@${request.jid.split('@')[0]}\n`;
			rejectedUsers.push(request.jid);
		}
		await message.send(rejectionList, { mentions: rejectedUsers });
	}
);

bot(
	{
		pattern: 'rgpp',
		public: false,
		isGroup: true,
		desc: 'Removes Group Profile Photo',
		type: 'group'
	},
	async message => {
		if (!(await message.isUserAdmin())) return;
		await message.client.removeProfilePicture(message.jid);
		return await message.send('_Group Profile Photo Removed!_');
	}
);

bot(
	{
		pattern: 'newgc',
		public: false,
		desc: 'Creates A New Group',
		type: 'group'
	},
	async (message, match) => {
		if (!match) return await message.send(`*Provide group name: .newgc GroupName*`);

		let groupName = match.split(';')[0];
		let members = [message.sender];

		if (message.reply_message?.sender) members.push(message.reply_message.sender);
		if (message.mention && message.mention[0]) members.push(message.mention[0]);
		if (match.split(';')[1]) {
			let additionalMembers = match
				.split(';')[1]
				.split(',')
				.map(member => member.trim());
			const ids = additionalMembers.map(member => toJid(member));
			members = [...members, ...ids];
		}
		members = [...new Set(members)];
		await message.client.groupCreate(groupName, members);
		return await message.send(`_Group Created_`);
	}
);

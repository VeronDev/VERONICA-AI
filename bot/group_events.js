import { isGroupEventEnabled } from '#sql';
import { getBuffer } from '#lib';

export async function GroupEvents(events, client) {
	if (!(await isGroupEventEnabled(events.Group))) return;

	const participant = events.participants[0];
	const promoter = events.by;
	const pp = await client.profilePictureUrl(participant, 'image').catch(() => null);

	// Handling Promotion
	if (events.action === 'promote') {
		if (pp !== null) {
			await client.sendMessage(events.Group, {
				image: await getBuffer(pp),
				caption: `\`\`\`@${
					participant.split('@')[0]
				} congrats, you are now an admin, you have be assigned this Admin Role By @${
					promoter.split('@')[0]
				}\`\`\``,
				mentions: [participant, promoter]
			});
		} else {
			await client.sendMessage(events.Group, {
				text: `\`\`\`@${
					participant.split('@')[0]
				} congrats, you are now an admin, you have be assigned this Admin Role By @${
					promoter.split('@')[0]
				}\`\`\``,
				mentions: [participant, promoter]
			});
		}
	}

	// Handling Demotion
	if (events.action === 'demote') {
		if (pp !== null) {
			await client.sendMessage(events.Group, {
				image: await getBuffer(pp),
				caption: `\`\`\`@${participant.split('@')[0]} has been demoted from admin role by @${
					promoter.split('@')[0]
				}\`\`\``,
				mentions: [participant, promoter]
			});
		} else {
			await client.sendMessage(events.Group, {
				text: `\`\`\`@${participant.split('@')[0]} has been demoted from admin role by @${
					promoter.split('@')[0]
				}\`\`\``,
				mentions: [participant, promoter]
			});
		}
	}
}

export async function GroupEventPartial(update, client) {
	if (!(await isGroupEventEnabled(update.id))) return;

	// Group name change
	if (update.subject) {
		if (!update.author) return;
		return await client.sendMessage(update.id, {
			text: `\`\`\`GROUP NAME WAS UPDATED\n\nBY: @${
				update?.author ? update.author.split('@')[0] : 'Unknown'
			}
\nNEW NAME: ${update.subject}\`\`\``,
			mentions: [update.author]
		});
	}

	// Group description update
	if (update.desc) {
		if (!update.author) return; // Exit if no author is found
		return await client.sendMessage(update.id, {
			text: `\`\`\`GROUP DESCRIPTION UPDATED\n\nBY: @${update.author.split('@')[0]}\nNEW DESC: ${
				update.desc
			}\`\`\``,
			mentions: [update.author]
		});
	}

	// Restrict mode (admin-only group info editing)
	if (typeof update.restrict !== 'undefined') {
		return await client.sendMessage(update.id, {
			text: update.restrict
				? `\`\`\`@${
						update.author.split('@')[0]
				  } has updated group settings to only allow admins to edit group info\`\`\``
				: `\`\`\`@${
						update.author.split('@')[0]
				  } has updated group settings to allow all participants to edit group info\`\`\``,
			mentions: [update.author]
		});
	}

	// Ephemeral messages
	if (typeof update.ephemeralDuration !== 'undefined') {
		let duration = '';
		if (!update.ephemeralDuration) {
			return await client.sendMessage(update.id, {
				text: `\`\`\`@${
					update?.author ? update.author.split('@')[0] : 'Unknown'
				} has disabled disappearing messages\`\`\``,
				mentions: [update.author]
			});
		}

		if (update.ephemeralDuration === 86400) duration = '24 hours';
		if (update.ephemeralDuration === 604800) duration = '7 days';
		if (update.ephemeralDuration === 7776000) duration = '90 days';

		return await client.sendMessage(update.id, {
			text: `\`\`\`@${
				update.author.split('@')[0]
			} has set disappearing messages to ${duration}\`\`\``,
			mentions: [update.author]
		});
	}

	// Join approval mode
	if (typeof update.joinApprovalMode !== 'undefined') {
		return await client.sendMessage(update.id, {
			text: update.joinApprovalMode
				? `\`\`\`@${
						update.author.split('@')[0]
				  } has updated the group settings for new participant must be approved by an admin before they can join the Group\`\`\``
				: `\`\`\`@${
						update.author.split('@')[0]
				  } has updated the group settings, participants can join without admin approval\`\`\``,
			mentions: [update.author]
		});
	}

	// Member add mode
	if (typeof update.memberAddMode !== 'undefined') {
		return await client.sendMessage(update.id, {
			text: update.memberAddMode
				? `\`\`\`@${
						update.author.split('@')[0]
				  } has updated the group settings for new participant must request to join the Group\`\`\``
				: `\`\`\`@${
						update.author.split('@')[0]
				  } has updated the group settings for new participants can be added without requesting\`\`\``,
			mentions: [update.author]
		});
	}
}

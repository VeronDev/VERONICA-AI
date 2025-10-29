import { config } from '#config';
import { schedule } from '#sql';

const getCurrentTime = () => {
	const timezone = config.TIME_ZONE;
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23',
		});
		const parts = formatter.formatToParts(new Date());
		const hour = parts.find(part => part.type === 'hour').value;
		const minute = parts.find(part => part.type === 'minute').value;
		return `${hour}:${minute}`;
	} catch (error) {
		throw new Error(`Invalid timezone: ${timezone}. Error: ${error.message}`);
	}
};

export const schedules = async msg => {
	const client = msg.client;
	setInterval(async () => {
		const currentTime = getCurrentTime();

		const schedules = await schedule.findAll({
			where: { isScheduled: true },
		});

		for (const schedule of schedules) {
			if (schedule.muteTime === currentTime && !schedule.isMuted) {
				await client.groupSettingUpdate(schedule.groupId, 'announcement');
				schedule.isMuted = true;
				await schedule.save();
				await client.sendMessage(schedule.groupId, { text: '```Group has been muted, due to AutoMute```' });
			}
			if (schedule.unmuteTime === currentTime && schedule.isMuted) {
				await client.groupSettingUpdate(schedule.groupId, 'not_announcement');
				schedule.isMuted = false;
				await schedule.save();
				await client.sendMessage(schedule.groupId, { text: '```Group is now unmuted, due to AutoUnMute```' });
			}
		}
	}, 60000);
};

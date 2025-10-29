import { bot } from '#lib';
import { exec } from 'child_process';
import simpleGit from 'simple-git';

const git = simpleGit();

bot(
	{
		pattern: 'update',
		public: false,
		desc: 'Update the bot',
		type: 'system'
	},
	async (message, match) => {
		const prefix = message.prefix;
		await git.fetch();

		const commits = await git.log([`master..origin/master`]);
		if (!match) {
			if (commits.total === 0) {
				return await message.send('```No update available```');
			} else {
				let changes = '```UPDATE FOUND```\n\n';
				changes += `*Changes:* \`\`\`${commits.total}\`\`\`\n`;
				changes += '*Updates:*\n';
				commits.all.forEach((commit, index) => {
					changes += `\`\`\`${index + 1}. ${commit.message}\`\`\`\n`;
				});
				changes += `\n*To update, use* \`\`\`${prefix}update now\`\`\``;
				await message.send(changes);
			}
		}
		if (match && match === 'now') {
			if (commits.total === 0) {
				return await message.send('```No changes in the latest commit```');
			}
			await message.send('*Updating...*');
			exec(`git stash && git pull origin master`, async (err, stdout, stderr) => {
				if (err) {
					return await message.send('```' + stderr + '```');
				}
				await message.send('*Restarting...*');
				const dependency = await updatedDependencies();
				if (dependency) {
					await message.send('*Dependencies changed. Installing new dependencies...*');
					exec(`npm install`, async (err, stdout, stderr) => {
						if (err) {
							return await message.send('```' + stderr + '```');
						}
						process.exit(0);
					});
				} else {
					process.exit(0);
				}
			});
		}
	}
);

const updatedDependencies = async () => {
	try {
		const diff = await git.diff([`master..origin/master`]);
		return diff.includes('"dependencies":');
	} catch (error) {
		console.error('Error occurred while checking package.json:', error);
		return false;
	}
};

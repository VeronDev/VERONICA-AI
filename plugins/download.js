import { bot } from '#lib';
import {
	convertToMp3,
	extractUrl,
	getFileAndSave,
	isfacebook,
	isInsta,
	isReddit,
	isRumble,
	isTikTok,
	isUrl,
	toTwitter,
	VERO
} from '#utils';
import { getBuffer, getJson } from '#lib';

const API = `https://api.nexoracle.com`;
const KEY = `free_key@maher_apis`;

bot(
	{
		pattern: 'apk',
		public: true,
		desc: 'Downloads Apk files',
		type: 'download'
	},
	async (message, match) => {
		if (!match) return message.send('_Give me Apk, eg. WhatsApp_');
		const data = (await getJson(`${API}/downloader/apk?apikey=${KEY}&q=${match}`)).result;
		const app = await getBuffer(data.dllink);
		return message.sendFile(app, data.name, data.name);
	}
);

bot(
	{
		pattern: 'facebook',
		public: true,
		desc: 'Downloads facebook Videos & Reels',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No facebook link found!_');
		url = extractUrl(url);
		if (!isfacebook(url)) return message.send('_Provide facebook link!_');
		const data = (await getJson(`${API}/downloader/facebook2?apikey=${KEY}&url=${url}`)).result;
		return await message.sendFromUrl(data.videoUrl, true, { caption: data.title });
	}
);

bot(
	{
		pattern: 'instagram',
		public: true,
		desc: 'Downloads Instagram, video & reels',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No Instagram link found!_');
		url = extractUrl(url);
		url = url.replace(/https:\/\/www\.instagram\.com\/([^\/]+)\//, 'https://www.instagram.com/');
		if (!isInsta(url)) return message.send('_Provide Instagram link!_');
		const data = (await getJson(`${API}/downloader/insta2?apikey=${KEY}&url=${url}`)).result;
		return await message.sendFromUrl(data.video);
	}
);

bot(
	{
		pattern: 'story',
		public: true,
		desc: 'Downloads Instagram Stories',
		type: 'download'
	},
	async (message, match) => {
		if (!match) return message.send('_Give me IG username_');
		const data = await fetch(`${API}/downloader/insta-story?apikey=${KEY}&username=${match}`)
			.then(r => r.json())
			.then(json => (json.status === 200 && json.result ? json.result : false))
			.catch(() => false);
		if (!data) return message.send(`_${match} has no stories at the moment_`);
		for (const story of data) {
			await message.sendFromUrl(story.url);
		}
	}
);

bot(
	{
		pattern: 'twitter',
		public: true,
		desc: 'Download X Videos',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No twitter link found!_');
		url = extractUrl(url);
		if (!toTwitter(url)) return message.send('_Provide Twitter link!_');
		url = toTwitter(url);
		const data = (await getJson(`${API}/downloader/twitter?apikey=${KEY}&url=${url}`)).result;
		return await message.sendFromUrl(data.video, true, { caption: data.caption });
	}
);

bot(
	{
		pattern: 'reddit',
		public: true,
		desc: 'Downloads Reddit Videos',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No Reddit link found!_');
		url = extractUrl(url);
		if (!isReddit(url)) return message.send('_Provide Reddit link!_');
		const data = (await getJson(`${API}/downloader/reddit?apikey=${KEY}&url=${url}`)).result;
		return message.sendFromUrl(data.url, true, { caption: data.title });
	}
);

bot(
	{
		pattern: 'tiktok',
		public: true,
		desc: 'Download Tiktok Video',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No Tiktok link found!_');
		url = extractUrl(url);
		if (!isTikTok(url)) return message.send('_Provide Tiktok link!_');
		const media = await VERO.tiktok(url);
		return await message.sendFromUrl(media.url, { caption: media.title });
	}
);

bot(
	{
		pattern: 'play',
		public: true,
		desc: 'Searchs and Downloads Audio',
		type: 'download'
	},
	async (message, match) => {
		if (!match) return message.send('_Give me song name to search for!_');
		if (isUrl(match)) return message.send('_No urls allowed, just name of your song_');
		const url = (await getJson(`${API}/downloader/yt-search?apikey=${KEY}&q=${match}`)).result[0]
			.url;
		const data = (await getJson(`${API}/downloader/yt-audio?apikey=${KEY}&url=${url}`)).result;
		const { title, desc, thumb } = data;
		const video = await VERO.youtube(url, { mp3: true });
		const mp3 = await getFileAndSave(video.url);
		const song = await convertToMp3(mp3);
		return await message.send(song, {
			mimetype: 'audio/mpeg',
			ptt: false,
			contextInfo: {
				externalAdReply: {
					title: title,
					body: desc,
					thumbnail: await getBuffer(thumb),
					renderLargerThumbnail: false,
					showAdAttribution: true
				}
			}
		});
	}
);

bot(
	{
		pattern: 'video',
		public: true,
		desc: 'Searchs and Downloads Video',
		type: 'download'
	},
	async (message, match) => {
		if (!match) return message.send('_Give me video name to search for!_');
		if (isUrl(match)) return message.send('_No urls allowed, just name of your video_');
		const url = (await getJson(`${API}/downloader/yt-search?apikey=${KEY}&q=${match}`)).result[0]
			.url;
		const data = (await getJson(`${API}/downloader/yt-audio?apikey=${KEY}&url=${url}`)).result;
		const { title, desc, thumb } = data;
		const res = await VERO.youtube(url, { mp4: true });
		const video = await getBuffer(res.url);
		return await message.send(video, {
			mimetype: 'video/mp4',
			contextInfo: {
				externalAdReply: {
					title: title,
					body: desc,
					thumbnail: await getBuffer(thumb),
					renderLargerThumbnail: false,
					showAdAttribution: true
				}
			}
		});
	}
);

const rumble = new Map();

bot(
	{
		pattern: 'rumble',
		public: true,
		desc: 'Download Rumble Videos',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No Rumble link found!_');
		url = extractUrl(url);
		if (!isRumble(url)) return message.send('_Provide a valid Rumble link!_');

		const data = (await getJson(`${API}/downloader/rumble?apikey=${KEY}&url=${url}`)).result;

		const { title, medias } = data;
		if (!medias || medias.length === 0) return message.send('_No downloadable media found!_');

		let optionsMessage = `*${title}*\n\nChoose a quality to download:\n`;
		const options = {};
		medias.forEach((media, index) => {
			const qualityOption = `${index + 1}`;
			options[qualityOption] = media.url;
			optionsMessage += `${qualityOption}. ${media.quality} (${media.formattedSize})\n`;
		});

		const msg = await message.send(optionsMessage);
		rumble.set(msg.id, { chatId: message.jid, options });
	}
);

bot(
	{
		on: 'reply',
		dontAddCommandList: true
	},
	async message => {
		const rumbleDL = message.reply_message?.id;
		if (!rumbleDL || !rumble.has(rumbleDL)) return;

		const replyContext = rumble.get(rumbleDL);
		if (replyContext.chatId !== message.jid) return;

		const userReply = message.text.trim();
		const mediaUrl = replyContext.options[userReply];
		if (!mediaUrl) {
			const validOptions = Object.keys(replyContext.options).join(', ');
			return message.send(`_Invalid reply. Please choose from: ${validOptions}_`);
		}
		await message.send(`wait...`);
		await message.sendFromUrl(mediaUrl);
		rumble.delete(rumbleDL);
	}
);

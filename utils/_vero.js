import { config } from '#config';
import { getBuffer, getJson } from '#lib';

const { API_ID } = config;

const VERO = {
	facebook: async url => {
		const res = await getJson(`${API_ID}/api/facebook?url=${encodeURIComponent(url)}`);
		return res.url;
	},
	instagram: async url => {
		const res = await fetch(`${API_ID}/api/instagram?url=${url}`);
		const json = await res.json();
		const bufferRes = await fetch(json.url);
		const data = await bufferRes.arrayBuffer();
		const dataBuffer = Buffer.from(data);
		return dataBuffer;
	},
	twitter: async url => {
		const res = await getJson(`${API_ID}/api/twitter?url=${url}`);
		return await getBuffer(res.url);
	},
	youtube: async (url, type = {}) => {
		if (type.mp4) {
			const res = `${API_ID}/api/ytmp4?url=${url}`;
			const data = await getJson(res);
			return {
				title: data.title,
				thumb: data.thumbnail,
				url: data.url
			};
		} else if (type.mp3) {
			const res = await getJson(`${API_ID}/api/ytmp3?url=${url}`);
			return {
				title: res.title,
				thumb: res.thumbnail,
				url: res.link
			};
		}
	},
	tiktok: async url => {
		const res = `${API_ID}/api/tiktok?url=${url}`;
		const data = await getJson(res);
		return {
			title: data.title,
			url: data.url
		};
	},
	chatbot: async text => {
		if (!text) return `_How can I help you today?_`;
		const res = await getJson(`${API_ID}/api/hericai?query=${text}`);
		return res.answer;
	},
	facts: async () => {
		const res = `${API_ID}/api/facts`;
		const data = await getJson(res);
		return data.fact;
	},
	quotes: async () => {
		const res = `${API_ID}/api/quotes`;
		const data = (await getJson(res)).quote;
		return `Quote: ${data.quote}\n\nAuthor: ${data.author}`;
	},
	advice: async () => {
		const res = `${API_ID}/api/advice`;
		const data = await getJson(res);
		return data.advice;
	},
	rizz: async () => {
		const res = `${API_ID}/api/rizz`;
		const data = await getJson(res);
		return data.text;
	},
	bible: async verse => {
		const res = `${API_ID}/api/bible?verse=${verse}`;
		const data = await getJson(res);
		return data.text;
	},
	fancy: async text => {
		const res = await getJson(`${API_ID}/api/fancy?text=${text}`);
		return res.result;
	},
	short: async url => {
		const res = await getJson(`${API_ID}/api/tinyurl?url=${url}`);
		return res.result;
	},
	generatePdf: async content => {
		if (!content) return '_No content provided_';
		return await getBuffer(`${API_ID}/api/textToPdf?content=${encodeURIComponent(content)}`);
	},
	maths: async expression => {
		const res = await getJson(`${API_ID}/api/solveMath?expression=${expression}`);
		return res.result;
	},
	searchSticker: async query => {
		const res = await getJson(`${API_ID}/api/ssticker?query=${query}`);
		return res.sticker;
	},
	obfuscate: async code => {
		if (!code) return 'Provide a code to obfuscate';
		const res = await getJson(`${API_ID}/api/obfuscate?code=${code}`);
		return res.result;
	},
	ttp: async text => {
		const res = await getJson(`${API_ID}/api/ttp?text=${text}`);
		return await getBuffer(res[0].url);
	},
	gitstalk: async username => {
		const res = await getJson(`${API_ID}/api/gitstalk?username=${username}`);
		return res;
	},
	google: async query => {
		const res = await getJson(`${API_ID}/api/google?query=${query}`);
		return res.result;
	},
	translate: async (text, lang) => {
		const res = await getJson(`${API_ID}/api/translate?text=${text}&to=${lang}`);
		return res.result;
	},
	wallpaper: async query => {
		const res = await getJson(`${API_ID}/api/wallpaper?query=${query}`);
		return res;
	},
	wikipedia: async query => {
		const res = await getJson(`${API_ID}/api/wikipedia?query=${query}`);
		return res;
	},
	mediafire: async url => {
		const res = await getJson(`${API_ID}/api/mediafire?url=${url}`);
		return res;
	},
	bing: async query => {
		const res = await getJson(`${API_ID}/api/bing?query=${query}`);
		return res.result;
	},
	technews: async () => {
		return await getJson(`${API_ID}/api/technews`);
	},
	news: async () => {
		return await getJson(`${API_ID}/api/news`);
	},
	forex: async type => {
		const res = await getJson(`${API_ID}/api/${type}`);
		return res;
	},
	yahoo: async query => {
		const res = await getJson(`${API_ID}/api/yahoo?query=${query}`);
		return res.result;
	},
	animenews: async () => {
		return await getJson(`${API_ID}/api/animenews`);
	},
	footballnews: async () => {
		return await getJson(`${API_ID}/api/footballnews`);
	},
	meme: async (text, type) => {
		const res = await getBuffer(`${API_ID}/api/meme/${type}?text=${encodeURIComponent(text)}`);
		return res;
	},
	airquality: async (country, city) => {
		try {
			const res = await getJson(
				`${API_ID}/api/airquality?country=${encodeURIComponent(country)}&city=${encodeURIComponent(
					city
				)}`
			);
			return res;
		} catch {
			return false;
		}
	},
	forex: async symbol => {
		try {
			const currency = symbol.toUpperCase();
			const res = await getJson(`${API_ID}/api/forex?symbol=${currency}`);
			return res;
		} catch {
			return false;
		}
	},
	wabeta: async () => {
		return await getJson(`${API_ID}/api/wabeta`);
	},
	voxnews: async () => {
		return await getJson(`${API_ID}/api/voxnews`);
	}
};

export { VERO };
export default VERO;

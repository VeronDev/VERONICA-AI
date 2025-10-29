import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { FileTypeFromBuffer } from '#lib';

export const remini = async (image, filterType) => {
	const availableFilters = ['enhance', 'recolor', 'dehaze'];
	const selectedFilter = availableFilters.includes(filterType) ? filterType : availableFilters[0];
	const apiUrl = `https://inferenceengine.vyro.ai/${selectedFilter}`;

	const form = new FormData();
	form.append('model_version', 1);

	const imageBuffer = Buffer.isBuffer(image) ? image : readFileSync(image);
	form.append('image', imageBuffer, {
		filename: 'enhance_image_body.jpg',
		contentType: 'image/jpeg'
	});
	const response = await axios.post(apiUrl, form, {
		headers: {
			...form.getHeaders(),
			'User-Agent': 'okhttp/4.9.3',
			Connection: 'Keep-Alive',
			'Accept-Encoding': 'gzip'
		},
		responseType: 'arraybuffer'
	});
	return Buffer.from(response.data);
};

export const uploadFile = async mediaBuffer => {
	const fileType = await FileTypeFromBuffer(mediaBuffer);
	if (!fileType) throw new Error('Unable to determine the file type of the media.');
	const filename = `file.${fileType}`;
	const tempPath = path.join(process.cwd(), filename);
	writeFileSync(tempPath, mediaBuffer);

	const form = new FormData();
	form.append('fileToUpload', createReadStream(tempPath), {
		filename,
		contentType: fileType
	});
	form.append('reqtype', 'fileupload');

	const response = await axios.post('https://catbox.moe/user/api.php', form, {
		headers: form.getHeaders()
	});
	const url = response.data.trim();
	unlinkSync(tempPath);
	return url;
};

export async function removeBg(buffer) {
	const formData = new FormData();
	const type = await FileTypeFromBuffer(buffer);
	const inputPath = path.join(process.cwd(), `temp_image.${type}`);
	writeFileSync(inputPath, buffer);
	formData.append('size', 'auto');
	formData.append('image_file', createReadStream(inputPath), path.basename(inputPath));
	const { status, data } = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
		responseType: 'arraybuffer',
		headers: {
			...formData.getHeaders(),
			'X-Api-Key': 'FjyTadatkyWixWGWUCUDTF7J'
		},
		encoding: null
	});
	unlinkSync(inputPath);
	return data;
}

export async function UguuUpload(input) {
	return new Promise(async (resolve, reject) => {
		const form = new FormData();
		let fileStream;

		if (Buffer.isBuffer(input)) {
			fileStream = input;
			form.append('files[]', fileStream, 'uploaded-file.jpg');
		} else if (typeof input === 'string') {
			fileStream = createReadStream(input);
			form.append('files[]', fileStream);
		} else {
			return reject(new Error('Invalid input type'));
		}

		try {
			const response = await axios({
				url: 'https://uguu.se/upload.php',
				method: 'POST',
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
					...form.getHeaders()
				},
				data: form
			});
			resolve(response.data.files[0].url);
		} catch (error) {
			reject(error);
		}
	});
}

export function pinterest(query) {
	return new Promise((resolve, reject) => {
		axios(
			`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`
		)
			.then(data => {
				const random =
					data.data.resource_response.data.results[
						Math.floor(Math.random() * data.data.resource_response.data.results.length)
					];
				var result = [];
				result = {
					status: 200,
					url: random.images.orig.url
				};
				resolve(result);
			})
			.catch(reject);
	});
}

export async function UploadFileUgu(input) {
	const form = new FormData();
	form.append('files[]', createReadStream(input));

	const { data } = await axios.post('https://uguu.se/upload.php', form, {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
			...form.getHeaders()
		}
	});

	return data.files[0];
}

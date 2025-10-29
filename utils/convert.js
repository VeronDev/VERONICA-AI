import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import FormData from 'form-data';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { config } from '#config';

const { writeFileSync, existsSync, readFileSync, mkdirSync } = fs;
ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = path.join(os.tmpdir(), 'media-temp');
if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

function temp(ext) {
	return path.join(tempDir, `${Date.now()}.${ext}`);
}

export const GIFBufferToVideoBuffer = async image => {
	const filename = `${Date.now()}`;
	const gifPath = `./${filename}.gif`;
	const mp4Path = `./${filename}.mp4`;
	writeFileSync(gifPath, image);
	await new Promise((resolve, reject) => {
		ffmpeg()
			.input(gifPath)
			.outputOptions([
				'-movflags faststart',
				'-pix_fmt yuv420p',
				'-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'
			])
			.toFormat('mp4')
			.save(mp4Path)
			.on('end', resolve)
			.on('error', reject);
	});
	const buffer = readFileSync(mp4Path);
	await Promise.all([fs.unlink(mp4Path), fs.unlink(gifPath)]);

	return buffer;
};

export async function audioToBlackVideo(input) {
	const video = temp('mp4');

	return new Promise((resolve, reject) => {
		ffmpeg()
			.input(`color=black:s=1920x1080:r=30`)
			.inputOptions(['-f', 'lavfi'])
			.input(input)
			.outputOptions([
				'-c:v',
				'libx264',
				'-preset',
				'ultrafast',
				'-crf',
				'23',
				'-c:a',
				'aac',
				'-b:a',
				'128k',
				'-map',
				'0:v',
				'-map',
				'1:a',
				'-shortest'
			])
			.output(video)
			.on('end', () => resolve(fs.readFileSync(video)))
			.on('error', reject)
			.run();
	});
}

export async function flipMedia(file, direction) {
	const outputFile = path.join(tempDir, `flipped_${path.basename(file)}`);
	const validDirections = {
		left: 'transpose=2',
		right: 'transpose=1',
		vertical: 'vflip',
		horizontal: 'hflip'
	};

	return new Promise((resolve, reject) => {
		ffmpeg(file)
			.videoFilters(validDirections[direction])
			.on('end', () => resolve(fs.readFileSync(outputFile)))
			.on('error', reject)
			.save(outputFile);
	});
}

export async function webpToImage(input) {
	const outputImage = temp('jpg');

	return new Promise((resolve, reject) => {
		ffmpeg(input)
			.output(outputImage)
			.on('end', () => resolve(fs.readFileSync(outputImage)))
			.on('error', reject)
			.run();
	});
}

export function convertToMp3(input) {
	const outputAudio = temp('mp3');

	return new Promise((resolve, reject) => {
		ffmpeg(input)
			.toFormat('mp3')
			.audioCodec('libmp3lame')
			.audioBitrate(192)
			.on('end', () => resolve(readFileSync(outputAudio)))
			.on('error', reject)
			.save(outputAudio);
	});
}

export function toPTT(input) {
	const outputAudio = temp('opus');

	return new Promise((resolve, reject) => {
		ffmpeg(input)
			.toFormat('opus')
			.audioCodec('libopus')
			.audioChannels(1) // Mono audio
			.audioFrequency(48000) // Standard Opus sample rate
			.audioBitrate('128k')
			.outputOptions([
				'-application voip' // Optimize for voice
			])
			.on('end', () => resolve(readFileSync(outputAudio)))
			.on('error', (err, stdout, stderr) => {
				reject(new Error(`FFmpeg error: ${err.message}\n${stderr}`));
			})
			.save(outputAudio);
	});
}

export function toVideo(input) {
	const outputVideo = temp('mp4');

	return new Promise((resolve, reject) => {
		ffmpeg(input)
			.videoCodec('libx264')
			.audioCodec('aac')
			.audioBitrate(128)
			.audioFrequency(44100)
			.outputOptions(['-crf 32', '-preset slow'])
			.on('end', () => resolve(readFileSync(outputVideo)))
			.on('error', reject)
			.save(outputVideo);
	});
}

export const cropToCircle = async input => {
	try {
		const image = sharp(input);
		const { width, height } = await image.metadata();
		const circleMask = Buffer.from(
			`<svg width="${width}" height="${height}">
		<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2}" fill="white"/>
	  </svg>`
		);

		const croppedImage = await image
			.composite([{ input: circleMask, blend: 'dest-in' }])
			.toFormat('webp', { quality: 50 })
			.toBuffer();
		return croppedImage;
	} catch (error) {
		console.error('Error cropping image to circle:', error);
		throw error;
	}
};

export async function resizeImage(imageBuffer, width, height) {
	if (!Buffer.isBuffer(imageBuffer)) {
		throw new Error('The imageBuffer parameter must be a valid Buffer.');
	}

	return sharp(imageBuffer)
		.resize(width, height, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.toBuffer();
}

export const isAnimatedWebp = filePath => {
	return new Promise((resolve, reject) => {
		sharp(filePath)
			.metadata()
			.then(metadata => {
				resolve(metadata.pages > 1); // If pages > 1, it's animated
			})
			.catch(error => {
				reject(error);
			});
	});
};

export const convertWebPFile = async input => {
	try {
		const form = new FormData();
		if (Buffer.isBuffer(input)) {
			form.append('file', input, {
				filename: `${Date.now()}.webp`,
				contentType: 'image/webp'
			});
		} else {
			form.append('file', readFileSync(input), {
				filename: path.basename(input),
				contentType: 'image/webp'
			});
		}

		const { data } = await axios.post(`${config.API_ID}/api/webpmp4`, form, {
			headers: {
				...form.getHeaders()
			},
			maxBodyLength: Infinity,
			maxContentLength: Infinity
		});

		return data.url;
	} catch (error) {
		console.error('Error converting file:', error.message);
		throw error;
	}
};

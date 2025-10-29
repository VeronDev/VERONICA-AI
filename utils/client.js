import { config } from '#config';

class ApiError extends Error {
	constructor(message, status, data) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.data = data;
	}
}

async function postUpload(url, data, options = {}) {
	const formData = new FormData();
	if (data.file instanceof File || data.file instanceof Blob) {
		if (data.file instanceof Blob && !data.file.name) {
			const ext = data.file.type ? `.${data.file.type.split('/')[1]}` : '';
			formData.append('file', data.file, `file${ext}`);
		} else {
			formData.append('file', data.file);
		}
	} else if (Buffer.isBuffer(data.file)) {
		const blob = new Blob([data.file]);
		formData.append('file', blob, data.filename || 'file.bin');
	} else {
		throw new ApiError('Invalid file type. Expected File, Blob, or Buffer.', 400);
	}

	Object.entries(data).forEach(([key, value]) => {
		if (key !== 'file' && value !== undefined) {
			formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
		}
	});

	const fetchOptions = {
		method: 'POST',
		body: formData,
		headers: { ...options.headers },
		signal: options.signal,
	};

	let timeoutId;
	if (options.timeout) {
		const controller = new AbortController();
		if (!options.signal) fetchOptions.signal = controller.signal;
		timeoutId = setTimeout(() => controller.abort(), options.timeout);
	}

	try {
		const response = await fetch(url, fetchOptions);
		const responseData = await response.json();
		if (!response.ok) throw new ApiError(responseData.message || 'Upload failed', response.status, responseData);
		return responseData;
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}

async function upload(file) {
	const response = await postUpload(`${config.API_ID}/api/upload`, { file }, { timeout: 30000 });
	return {
		success: true,
		fileUrl: response.fileUrl,
		rawUrl: response.rawUrl,
		expiresAt: response.expiresAt,
		originalname: response.originalname,
		size: response.size,
		type: response.type,
	};
}

export { postUpload, upload, ApiError };

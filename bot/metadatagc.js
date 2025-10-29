import { saveGroupMetadata } from '#sql';

const CONFIG = {
	INITIAL_DELAY: 600000,
	PROCESS_DELAY: 5000,
	RATE_LIMIT_DELAY: 900000,
	MAX_CONCURRENT: 1,
	RETRY_DELAY: 180000,
	MAX_RETRIES: 3
};

/**
 * Handles rate limiting and queue management for group metadata updates
 */
class RateLimitHandler {
	constructor() {
		this.queue = new Map();
		this.processing = false;
		this.retryCount = 0;
		this.lastProcessTime = 0;
	}

	/**
	 * Delays execution for specified milliseconds
	 * @param {number} ms - Milliseconds to delay
	 */
	async delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Processes a single group's metadata
	 * @param {string} jid - Group JID
	 * @param {Object} conn - Connection object
	 */
	async processGroup(jid, conn) {
		try {
			const now = Date.now();
			const timeSinceLastProcess = now - this.lastProcessTime;

			if (timeSinceLastProcess < CONFIG.PROCESS_DELAY) {
				await this.delay(CONFIG.PROCESS_DELAY - timeSinceLastProcess);
			}

			await saveGroupMetadata(jid, conn);
			this.lastProcessTime = Date.now();

			return true;
		} catch (error) {
			if (error?.data === 429) {
				throw error;
			}
			return false;
		}
	}

	/**
	 * Processes the queue of groups
	 * @param {Object} conn - Connection object
	 */
	async processQueue(conn) {
		if (this.processing) {
			return;
		}

		this.processing = true;

		try {
			for (const [jid, retries] of this.queue.entries()) {
				if (retries >= CONFIG.MAX_RETRIES) {
					this.queue.delete(jid);
					continue;
				}

				try {
					await this.processGroup(jid, conn);
					this.queue.delete(jid);
				} catch (error) {
					if (error?.data === 429) {
						await this.delay(CONFIG.RATE_LIMIT_DELAY);
						this.queue.set(jid, retries + 1);
						break;
					}
				}

				await this.delay(CONFIG.PROCESS_DELAY);
			}
		} finally {
			this.processing = false;
		}
	}
}

/**
 * Updates group metadata with rate limiting
 * @param {Object} msg - Message object
 */
export const updateGroupMetadata = async msg => {
	const conn = msg.client;
	const handler = new RateLimitHandler();

	const updateGroups = async () => {
		try {
			const groups = await conn.groupFetchAllParticipating();

			if (!groups) {
				return;
			}

			const groupIds = Object.keys(groups);

			for (const jid of groupIds) {
				if (!handler.queue.has(jid)) {
					handler.queue.set(jid, 0);
				}
			}

			await handler.processQueue(conn);
		} catch (error) {
			if (error?.data === 429) {
				await handler.delay(CONFIG.RATE_LIMIT_DELAY);
			}
		}
	};

	await handler.delay(CONFIG.INITIAL_DELAY);
	await updateGroups();
	setInterval(updateGroups, CONFIG.INITIAL_DELAY);
};

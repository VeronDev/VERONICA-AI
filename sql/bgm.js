import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

const BGMDB = DATABASE.define(
	'bgm',
	{
		word: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			primaryKey: true,
		},
		response: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: false,
		tableName: 'bgm',
	},
);

/**
 * Adds a new BGM entry to the database
 * @param {string} word - The trigger word for the BGM
 * @param {string} response - The response text or file path
 * @returns {Promise<Object>} The created BGM entry
 * @throws {Error} If word already exists or if parameters are invalid
 */
async function addBgm(word, response) {
	if (!word || !response) {
		throw new Error('Both word and response are required');
	}

	try {
		const bgmEntry = await BGMDB.create({
			word: word.toLowerCase(),
			response: response,
		});
		return bgmEntry;
	} catch (error) {
		if (error.name === 'SequelizeUniqueConstraintError') {
			throw new Error(`BGM entry for word "${word}" already exists`);
		}
		throw error;
	}
}

/**
 * Retrieves the BGM response for a given word
 * @param {string} word - The word to look up
 * @returns {Promise<string|null>} The response for the word, or null if not found
 */
async function getBgmResponse(word) {
	if (!word) {
		throw new Error('Word parameter is required');
	}

	const bgmEntry = await BGMDB.findOne({
		where: {
			word: word.toLowerCase(),
		},
	});

	return bgmEntry ? bgmEntry.response : null;
}

/**
 * Deletes a BGM entry for the given word
 * @param {string} word - The word to delete
 * @returns {Promise<boolean>} True if deleted successfully, false if entry wasn't found
 */
async function deleteBgm(word) {
	if (!word) {
		throw new Error('Word parameter is required');
	}

	const deletedCount = await BGMDB.destroy({
		where: {
			word: word.toLowerCase(),
		},
	});

	return deletedCount > 0;
}

/**
 * Retrieves a sorted list of BGM (Background Music) entries from the database.
 * @async
 * @function getBgmList
 * @returns {Promise<Array<{word: string, response: string}>>} A promise that resolves to an array of BGM objects containing word and response properties
 * @throws {Error} When there is an error retrieving the BGM list from the database
 */
async function getBgmList() {
    try {
        const bgmList = await BGMDB.findAll({
            attributes: ['word', 'response'],
            order: [['word', 'ASC']]
        })
        return bgmList.map(bgm => ({
            word: bgm.word,
            response: bgm.response
        }))
    } catch (error) {
        throw new Error(`Failed to get BGM list: ${error.message}`)
    }
}

export { BGMDB, addBgm, getBgmResponse, deleteBgm, getBgmList };

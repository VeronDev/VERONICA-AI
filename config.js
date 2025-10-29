//** BASE BY ASTROX11 **/
//** UPDATED BY VERONDEV **/
import dotenv from 'dotenv';

dotenv.config();

const config = {
	SESSION_ID: process.env.SESSION_ID || ' ',
	// set there👆the sessions id
	SUDO: process.env.SUDO || '256752792178',
	//👆 Change that number to yours
	API_ID: process.env.API_ID || 'https://terrisapi.zone.id/',
	BOT_INFO: process.env.BOT_INFO || 'VᴇʀᴏDᴇᴠ;Vᴇʀᴏɴɪᴄᴀ Aɪ',
	STICKER_PACK: process.env.STICKER_PACK || 'мα∂є ву;Vᴇʀᴏɴɪᴄᴀ Aɪ',
	WARN_COUNT: process.env.WARN_COUNT || 3,
	TIME_ZONE: process.env.TIME_ZONE || 'Africa/kampala',
	DEBUG: process.env.DEBUG || false,
	VERSION: '2.0.0'
};

export { config };
export default { config };

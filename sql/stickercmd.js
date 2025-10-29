import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

const StickerDB = DATABASE.define(
	'StickerCmd',
	{
		uid: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		cmd: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		id: {
			type: DataTypes.STRING,
			allowNull: false
		}
	},
	{
		tableName: 'stickercmd',
		timestamps: false
	}
);

async function setcmd(cmd, id) {
	const [stickerCmd, created] = await StickerDB.findOrCreate({
		where: { cmd },
		defaults: { id }
	});
	if (!created) await stickerCmd.update({ id });
	return true;
}

async function delcmd(cmd) {
	const deleted = await StickerDB.destroy({
		where: { cmd }
	});
	return deleted > 0;
}

async function getcmd() {
	const commands = await StickerDB.findAll();
	return commands.map(cmd => ({
		cmd: cmd.cmd,
		id: cmd.id
	}));
}

async function isStickerCmd(id) {
	const stickerCmd = await StickerDB.findOne({
		where: { id }
	});

	if (stickerCmd) {
		return {
			exists: true,
			command: {
				cmd: stickerCmd.cmd,
				id: stickerCmd.id
			}
		};
	}

	return {
		exists: false,
		command: null
	};
}

export { StickerDB, setcmd, delcmd, getcmd, isStickerCmd };

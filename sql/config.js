import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const CONFIG_CMDS = DATABASE.define(
	'CONFIG_CMDS',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		autoRead: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		autoStatusRead: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		cmdReact: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		cmdRead: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		mode: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		PREFIX: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '.',
		},
		disabledCmds: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '',
		},
		autolikestatus: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		disablegc: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		disabledm: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: 'configs',
		timestamps: false,
	},
);

async function ensureConfigExists() {
	const [config] = await CONFIG_CMDS.findOrCreate({
		where: { id: 1 },
		defaults: {
			autoRead: false,
			autoStatusRead: false,
			cmdReact: true,
			cmdRead: false,
			mode: false,
			PREFIX: '.',
			disabledCmds: '',
			autolikestatus: false,
			disablegc: false,
			disabledm: false,
		},
	});
	return config;
}

async function updateConfig(field, value) {
	const config = await ensureConfigExists();

	if (field === 'disabledCmds' && Array.isArray(value)) {
		const currentCmds = config.disabledCmds ? config.disabledCmds.split(',') : [];
		const newCmds = [...new Set([...currentCmds, ...value])];
		await config.update({ [field]: newCmds.join(',') });
	} else {
		const updatedValue = field === 'PREFIX' ? value : !!value;
		await config.update({ [field]: updatedValue });
	}

	return config;
}

async function getConfig() {
	const config = await ensureConfigExists();
	return {
		autoRead: config.autoRead,
		autoStatusRead: config.autoStatusRead,
		cmdReact: config.cmdReact,
		cmdRead: config.cmdRead,
		mode: config.mode,
		PREFIX: config.PREFIX,
		disabledCmds: config.disabledCmds ? config.disabledCmds.split(',').filter(Boolean) : [],
		autolikestatus: config.autolikestatus,
		disablegc: config.disablegc,
		disabledm: config.disabledm,
	};
}

async function addDisabledCmd(cmd) {
	const config = await ensureConfigExists();
	const currentCmds = config.disabledCmds ? config.disabledCmds.split(',').filter(Boolean) : [];

	if (currentCmds.includes(cmd)) {
		return { success: false, message: '_Command already disabled._' };
	}

	currentCmds.push(cmd);
	await config.update({ disabledCmds: currentCmds.join(',') });
	return { success: true, message: `_${cmd} command disabled_` };
}

async function removeDisabledCmd(cmd) {
	const config = await ensureConfigExists();
	const currentCmds = config.disabledCmds ? config.disabledCmds.split(',').filter(Boolean) : [];

	if (!currentCmds.includes(cmd)) {
		return { success: false, message: '_Command is not disabled._' };
	}

	const updatedCmds = currentCmds.filter(disabledCmd => disabledCmd !== cmd);
	await config.update({ disabledCmds: updatedCmds.join(',') });
	return { success: true, message: `_${cmd} command enabled_` };
}

async function isCmdDisabled(cmd) {
	const config = await ensureConfigExists();
	const currentCmds = config.disabledCmds ? config.disabledCmds.split(',').filter(Boolean) : [];
	return currentCmds.includes(cmd);
}

export { updateConfig, getConfig, addDisabledCmd, removeDisabledCmd, isCmdDisabled };

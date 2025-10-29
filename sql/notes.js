import { DataTypes } from 'sequelize';
import { DATABASE } from '#lib';

export const NotesDB = DATABASE.define(
	'NotesDB',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		timestamps: false,
		tableName: 'notes',
	},
);

export async function addNote(title, content) {
	const newNote = await NotesDB.create({ title, content });
	return newNote;
}

export async function updateNote(id, updates) {
	const [updated] = await NotesDB.update(updates, {
		where: { id },
	});
	if (updated) {
		const updatedNote = await NotesDB.findByPk(id);
		return updatedNote;
	}
	throw new Error('Note not found');
}

export async function removeNote(id) {
	const deleted = await NotesDB.destroy({
		where: { id },
	});
	return deleted;
}

export async function getNotes() {
	const notes = await NotesDB.findAll();
	return notes;
}

export async function getNote(id) {
	const note = await NotesDB.findByPk(id);
	return note;
}
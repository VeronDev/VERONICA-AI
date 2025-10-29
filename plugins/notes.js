import { bot } from '#lib';
import { addNote, removeNote, updateNote, getNotes } from '#sql';

bot(
	{
		pattern: 'addnote',
		public: true,
		desc: 'Create Notes',
		type: 'notes'
	},
	async (message, match) => {
		const text = match.trim() || message.reply_message?.text;
		if (!text) return await message.send('*Format*: _.addnote title|content_');
		const [title, content] = text.split('|');
		if (!title) return await message.send('*Format*: _.addnote title|content_');
		const words = content ? content.trim().split(/\s+/) : [];
		if (words.length > 500) return await message.send('*Content exceeds 500 words limit*');
		const newNote = await addNote(title, content || '').catch(() => null);
		if (!newNote) return await message.send('*Unable to perform action*');
		return await message.send(`*Note added*\n\n*ID*: ${newNote.id}`);
	}
);

bot(
	{
		pattern: 'delnote',
		public: true,
		desc: 'Delete a Note',
		type: 'notes'
	},
	async (message, match) => {
		const noteId = parseInt(match.trim());
		if (!noteId || isNaN(noteId)) return await message.send('*Format*: _.delnote id_');
		const deleted = await removeNote(noteId).catch(() => null);
		if (!deleted) return await message.send('*Unable to perform action*');
		return await message.send(`*Note deleted*`);
	}
);

bot(
	{
		pattern: 'editnote',
		public: true,
		desc: 'Update an Existing Note',
		type: 'notes'
	},
	async (message, match) => {
		const text = match.trim() || message.reply_message?.text;
		if (!text) return await message.send('*Format*: _.editnote id; title|content_');
		const [id, content] = text.split(';').map(item => item.trim());
		if (!id || !content) return await message.send('*Format*: _.editnote id; title|content_');
		const [title, newContent] = content.split('|');
		const updates = {
			title: title.trim(),
			content: newContent?.trim() || ''
		};
		const updatedNote = await updateNote(parseInt(id), updates).catch(() => null);
		if (!updatedNote) return await message.send('*Unable to perform action*');
		return await message.send('*Note updated*');
	}
);

bot(
	{
		pattern: 'getnotes',
		public: true,
		desc: 'List all Notes',
		type: 'notes'
	},
	async message => {
		const notes = await getNotes().catch(() => null);
		if (!notes) return await message.send('*Unable to perform action*');
		if (notes.length === 0) return await message.send('*No notes found*');
		const notesList = notes.map((note, index) => `${index + 1}. ${note.title}`).join('\n');
		return await message.send(`*_Notes:_*\n\n${notesList}`);
	}
);

bot(
	{
		pattern: 'cnote',
		public: true,
		desc: 'Get Note Content',
		type: 'notes'
	},
	async (message, match) => {
		const noteId = parseInt(match.trim());
		if (!noteId || isNaN(noteId)) return await message.send('*Format*: _.cnote id_');
		const notes = await getNotes().catch(() => null);
		if (!notes) return await message.send('*Unable to perform action*');
		const note = notes.find(n => n.id === noteId);
		if (!note) return await message.send('*Note not found*');
		return await message.send(`*Title*: ${note.title}\n*Content*: ${note.content}`);
	}
);

const xss = require('xss');

const notesService = {
  serializeNote(note) {
    return {
      id: note.id,
      modified: note.modified,
      date_created: note.date_created,
      note_name: xss(note.note_name),
      folder_id: note.folder_id,
      content: xss(note.content)
    }
  },
  getNotes(db) {
    return db('notes')
      .select('*');
  },
  getNotesByFolder(db, folder_id) {
    return db('notes')
      .select('*')
      .where( { folder_id })
      .then(notes => notes);
  },
  addNote(db, note) {
    return db('notes')
      .insert(note)
      .returning('*')
      .then( ([addedNote]) => addedNote);
  },
  deleteNote(db, id) {
    return db('notes')
      .where({ id })
      .delete();
  },
  getNoteById(db, id) {
    return db('notes')
      .select('*')
      .where( { id} )
      .first();
  },
  getFolderById(db, id) {
    return db('folders')
      .select('*')
      .where( { id} )
      .first();
  },
  updateNote(db, id, note){
    return db('notes')
    .update(note, returning = true)
    .where({ id })
    .returning('*')
    .then(rows => {
        return rows[0]
    })
  },
  validateName(name) {
    let erObj = null;
    if(!name){
      erObj = {error: {message: `'note_name' must be provided`}}
    }
    else if(typeof(name) !== 'string'){
      erObj = {error: {message: `'note_name' must be a string`}}
    }
    else if(name == ''){
      erObj = {error: {message: `'note_name' cannot be empty`}}
    }

    return erObj;
  },
  validateContent(content) {
    let erObj = null;
    if(!content){
      erObj = {error: {message: `'content' must be provided`}}
    }
    else if(typeof(content) !== 'string'){
      erObj = {error: {message: `'content' must be a string`}}
    }
    else if(content == ''){
      erObj = {error: {message: `'content' cannot be empty`}}
    }
  }
  };
  
  module.exports = notesService;
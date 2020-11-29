const xss = require('xss');

const FoldersService = {
  serializeFolder(folder) {
    return {
      id: folder.id,
      name: xss(folder.name),
    }
  },
  getFolders(db) {
    return db('folders')
      .select('*');
  },
  addFolder(db, folder) {
    return db('folders')
      .insert(folder)
      .returning('*')
      .then( ([addedFolder]) => addedFolder);
  },
  deleteFolder(db, id) {
    return db('folders')
      .where({ id })
      .delete();
  },
  getFolderById(db, id) {
    return db('folders')
      .select('*')
      .where( { id} )
      .first();
  },
  updateFolder(db, id, folder){
    return db('folders')
    .update(folder, returning = true)
    .where({
        id
    })
    .returning('*')
    .then(rows => {
        return rows[0]
    })
  },
  validateName(name) {
    let erObj = null;
    if(!name){
      erObj = {error: {message: `'name' must be provided`}}
    }
    else if(typeof(name) !== 'string'){
      erObj = {error: {message: `'name' must be a string`}}
    }
    else if(name == ''){
      erObj = {error: {message: `'name' cannot be empty`}}
    }

    return erObj;
  },
  };
  
  module.exports = FoldersService;
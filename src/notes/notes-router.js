const express = require('express');
const path = require('path'); 

const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter.route('/')
  .get((req, res, next) => {
    NotesService.getNotes(req.app.get('db'))
      .then(allNotes => {
        console.log('>>>>ALL THE NOTES: ', allNotes);
        res.status(200).json(allNotes.map(note => NotesService.serializeNote(note)))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, content, folder_id } = req.body;

    const nameValidationError = NotesService.validateName(name);
    if(nameValidationError){
      nameValidationError.note = {name, content, folder_id};
      return res.status(400).json(nameValidationError);
    }
    const contentValidationError = NotesService.validateContent(content);
    if(contentValidationError){
      contentValidationError.note = {name, content, folder_id}
      return res.status(400).json(contentValidationError);
    }
    
    const newNote = {
      name,
      content,
      folder_id
    };

    NotesService.addNote(req.app.get('db'), newNote)
      .then(addedNote => {
        console.log('the added note is: ', addedNote);
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${addedNote.folder_id}/${addedNote.id}`))
          .json(NotesService.serializeNote(addedNote));
      })
     .catch(next);
    })

notesRouter.route('/:folder_id')
  .all( (req, res, next) => {
    const {folder_id} = req.params;
    NotesService.getFolderById(req.app.get('db'), folder_id)
      .then(folderWithId => {
        if(!folderWithId){
          return res.status(404).json({error: {message: `Folder does not exist`}})
        }

        res.folder = folderWithId;
        next();
      })
  })
  .get((req, res, next) => {
    NotesService.getNotesByFolder(req.app.get('db'), res.folder.id)
    .then(notes => {
      console.log('All notes of folder: ', notes);
      res.json(notes);
    })
    .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { name, content } = req.body;

    const nameValidationError = NotesService.validateName(name);
    if(nameValidationError){
      return res.status(400).json(nameValidationError);
    }
    const contentValidationError = NotesService.validateContent(content);
    if(contentValidationError){
      return res.status(400).json(contentValidationError);
    }
    
    const newNote = {
      name,
      content,
      folder_id: res.folder.id
    };

    NotesService.addNote(req.app.get('db'), newNote)
      .then(addedNote => {
        console.log('the added note is: ', addedNote);
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${addedNote.folder_id}/${addedNote.id}`))
          .json(NotesService.serializeNote(addedNote));
      })
     .catch(next);
    })
    
notesRouter.route('/:folder_id/:note_id')
  .all( (req, res, next) => {
    const {folder_id} = req.params;
    NotesService.getFolderById(req.app.get('db'), folder_id)
      .then(folderWithId => {
        if(!folderWithId){
          return res.status(404).json({error: {message: `Folder does not exist`}})
        }

        res.folder = folderWithId;
        
      })

    const {note_id} = req.params;
    NotesService.getNoteById(req.app.get('db'), note_id)
      .then(noteWithId => {
        if(!noteWithId){
          return res.status(404).json({error:{message: `Note does note exist`}})
        }

        res.note = noteWithId;
        next();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get('db'), res.note.id)
      .then(numRowsDeleted => {
        console.log('deleted rows number: ', numRowsDeleted);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch( jsonParser, (req, res, next) => {
    const {name, content} = req.body;
    const noteToPatchWith = {
      name,
      content,
      folder_id: res.note.folder_id,
      modified: now()
    };

    const nameValidationError = NotesService.validateName(name);
    if(nameValidationError){
      return res.status(400).json(nameValidationError);
    }
    const contentValidationError = NotesService.validateContent(content);
    if(contentValidationError){
      return res.status(400).json(contentValidationError);
    }

    NotesService.updateNote(req.app.get('db'), noteToPatchWith)
      .then(updatedNote => {
        console.log('the note has been updated to: ', updatedNote);
        res.status(200).json(NotesService.serializeNote(updatedNote))
      })
      .catch(next);
  })




module.exports = notesRouter;
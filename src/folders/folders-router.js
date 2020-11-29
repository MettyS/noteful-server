const express = require('express');
const path = require('path'); 

const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();


foldersRouter.route('/')
  .get((req, res, next) => {
    FoldersService.getFolders(req.app.get('db'))
    .then(folders => {
      console.log('All folders: ', folders);
      res.json(folders);
    })
    .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const { name } = req.body;

    const validationError = FoldersService.validateName(name);
    if(validationError){
      return res.status(400).json(validationError);
    }
    
    const newFolder = {
      name
    };

    FoldersService.addFolder(req.app.get('db'), newFolder)
      .then(addedFolder => {
        console.log('the added folder is: ', addedFolder);
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${addedFolder.id}`))
          .json(FoldersService.serializeFolder(addedFolder));
      })
     .catch(next);
    })
    
foldersRouter.route('/:folder_id')
  .all( (req, res, next) => {
    const {folder_id} = req.params;
    FoldersService.getFolderById(req.app.get('db'), folder_id)
      .then(folderWithId => {
        if(!folderWithId){
          return res.status(404).json({error: {message: `Folder does not exist`}})
        }

        res.folder = folderWithId;
        next();
      })
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), res.folder.id)
      .then(numRowsDeleted => {
        console.log('deleted rows number: ', numRowsDeleted);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch( jsonParser, (req, res, next) => {
    const {name} = req.body;
    const folderToPatchWith = {
      name
    };

    FoldersService.updateFolder(req.app.get('db'), folderToPatchWith)
      .then(updatedFolder => {
        console.log('the folder has been updated to: ', updatedFolder);
        res.status(200).json(FoldersService.serializeFolder(updatedFolder))
      })
      .catch(next);
  })




module.exports = foldersRouter;
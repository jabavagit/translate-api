import { NextFunction, Request, Response } from 'express';
import { readFolders, redFilesAndSetDB } from '@utils/files';
import { setFilesToProjectModel, setProjectsModel } from '@/models/files.model';

class IndexController {
  public importFiles = [];
  public init = (): void => {
    try {
      const folders: any = readFolders();
      for (const key in folders) {
        if (Object.prototype.hasOwnProperty.call(folders, key)) {
          const { id, name } = folders[key];
          this.importFiles.push(setProjectsModel(id, name));
          const files = readFolders(name);
          setFilesToProjectModel(name, this.importFiles, files);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  public selectedFoldersProjects = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { idProjects } = req.body;
      redFilesAndSetDB(idProjects, this.importFiles);
      res.json(this.importFiles);
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;

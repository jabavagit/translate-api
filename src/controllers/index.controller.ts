import { NextFunction, Request, Response } from 'express';
import { readFolders, readFiles } from '@utils/files';
import { setFilesToProjectModel, setProjectsModel } from '@/models/files.model';
import dbService from '@/services/db.service';
import { Project } from '@/types/api.type';

class IndexController {
  public importFiles: any = [];
  public dbService = new dbService();

  public init = (): void => {
    try {
      this.dbService.init();
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

  public getImportFiles = (req: Request, res: Response, next: NextFunction): void => {
    res.json(this.importFiles);
  };

  public selectedFoldersProjects = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { idProjects } = req.body;
      const dataFiles = readFiles(idProjects, this.importFiles);
      this.dbService.setDataFiles(dataFiles);

      res.json(dataFiles);
    } catch (error) {
      next(error);
    }
  };

  public getProject = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { idProject } = req.params;
      const data: Project[] = this.dbService.getProject(Number(idProject));

      res.json(data);
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;

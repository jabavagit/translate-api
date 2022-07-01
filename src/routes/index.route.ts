import { Router } from 'express';
import IndexController from '@controllers/index.controller';
//import { Routes } from '@interfaces/routes.interface';
import { Routes } from '@/types/api.type';

class IndexRoute implements Routes {
  public path = '/api';
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
    this.indexController.init();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/import`, this.indexController.getImportFiles);
    this.router.get(`${this.path}/project/:idProject`, this.indexController.getProject);
    this.router.post(`${this.path}/import/`, this.indexController.selectedFoldersProjects);
  }
}

export default IndexRoute;

import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';

class IndexRoute implements Routes {
  public path = '/api';
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
    this.indexController.init();
  }

  private initializeRoutes() {
    //this.router.get(`${this.path}/`, this.indexController.index);
    this.router.post(`${this.path}/import/`, this.indexController.selectedFoldersProjects);
  }
}

export default IndexRoute;

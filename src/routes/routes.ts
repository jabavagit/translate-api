import { log } from 'console';
import * as express from 'express';
import routesProjects from './projects/projects.routes';
import routesApi from './api/api.routes';
import * as dashboardCtrl from '../controllers/dashboard';
import { setAlerts } from '../utils/utils';

export const register = (app: express.Application, engine: string) => {
    if(engine === 'ejs') {
        // engine EJS
        app.get('/', async (req: any, res: any) => {
            const model: any = await dashboardCtrl.init();
            res.render('index', model);
        }).get('/import/:type', async (req: any, res: any) => {
            const { type } = req.params;
            const model: any = await dashboardCtrl.importFile(type);
            if (type === 'origin') {
                setAlerts('SUCCESS', 'importar origin.');
                res.redirect('/');
            } else {
                res.render('index', model);
            }
        }).post('/import', async (req: any, res: any) => {
            const result: any = dashboardCtrl.importForm(req.body);
            log(result);
            res.redirect('/');
        }).get('/import-info', async (req: any, res: any) => {
            const { idProject, nameLiteral } = req.query;
            const data: any = dashboardCtrl.searchLiterals(idProject, nameLiteral);
            const existLiteral = data ? true : false;
            res.json({existLiteral});
        }).get('/search', async (req: any, res: any) => {
            const { search } = req.query;
            const result: any = dashboardCtrl.search(search);
            res.json(result);
        });
    
        app.use('/projects', routesProjects);
    } else {
        // engine ANGULAR
        app.use('/api', routesApi);
    }
    
};
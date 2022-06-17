import * as express from 'express';
const router = express.Router();
import * as service from '../../services/service';
const importFileCtrl = require('../../controllers/import-file');
import * as dashboardCtrl from '../../controllers/dashboard';

router.get('/init', async (req: any, res: any) => {
    //let data = await service.init();
    const model: any = await dashboardCtrl.init();
    res.json(model);
}).get('/projects/:id', async (req: any, res: any) => {
    let data = await service.getProjects(req.params.id);
    res.json(data);
}).post('/project/:id', async (req: any, res: any) => {
    let data = await service.setLiteral(Number(req.params.id), req.body);
    res.json(data);
}).get('/json/:id', async (req: any, res: any) => {
    let data = await service.getGeneralteJsonProjects(req.params.id);
    res.json(data);
}).get('/import/:type', async (req: any, res: any) => {
    const { type } = req.params;
    const model: any = await dashboardCtrl.importFile(type);
    if (type === 'origin') {
        //setAlerts('SUCCESS', 'importar origin.');
        res.json({
            status: 200,
            code: 200
        });
    } else {
        res.json({
            status: 200,
            code: 200,
            data: model.dashboard.import
        });
    }
});

router.get('/import', importFileCtrl.importFile);

export default router;

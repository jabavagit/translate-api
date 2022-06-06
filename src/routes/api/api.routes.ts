import * as express from 'express';
const router = express.Router();
import * as service from '../../services/service';
const importFileCtrl = require('../../controllers/import-file');

router.get('/init', async (req: any, res: any) => {
    let data = await service.init();

    res.json(data);
});

router.get('/projects/:id', async (req: any, res: any) => {
    let data = await service.getProjects(req.params.id);

    res.json(data);
});

router.post('/project/:id', async (req: any, res: any) => {
    let data = await service.setLiteral(Number(req.params.id), req.body);

    res.json(data);
});

router.get('/json/:id', async (req: any, res: any) => {
    let data = await service.getGeneralteJsonProjects(req.params.id);

    res.json(data);
});

router.get('/import', importFileCtrl.importFile);

export default router;

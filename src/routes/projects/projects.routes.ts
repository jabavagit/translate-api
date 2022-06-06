import { error } from 'console';
import * as express from 'express';
import { getAlerts, setAlerts } from '../../utils/utils';
const router = express.Router();
import * as dashboardCtrl from '../../controllers/dashboard';
import { getModel } from '../../controllers/dashboard';

router.get('/:id', (req: any, res: any) => {
    const { id } = req.params;
    const model = dashboardCtrl.getProject(id);
    res.render('index', model);
})
    .get('/:id/filter/:filter', (req: any, res: any) => {
        const { id, filter } = req.params;
        const model = dashboardCtrl.getProject(id, filter);
        res.render('index', model);
    })
    .get('/:idProject/literal/:idLiteral', (req: any, res: any) => {
        const { idProject, idLiteral } = req.params;
        const model = dashboardCtrl.getLiteral(idProject, idLiteral);
        res.render('index', model);
    })
    .post('/:idProject/literal/:idLiteral', (req: any, res: any) => {
        const { idProject, idLiteral } = req.params;
        const result = dashboardCtrl.postLiteral(idProject, idLiteral, req.body);
        if(result.code === 200) {
            setAlerts('SUCCESS', 'literal guardado.');
            res.redirect(`/projects/${idProject}`);
        } else {
            setAlerts('ERROR', 'literal no guardado.');
            error('[Error] set literal ', result);
        }
    })
    .get('/:idProject/literal-new', (req: any, res: any) => {
        const { idProject, idLiteral } = req.params;
        const model = dashboardCtrl.getLiteral(idProject, idLiteral, true);
        res.render('index', model);
    })
    .post('/:idProject/literal-new', (req: any, res: any) => {
        const { idProject, idLiteral } = req.params;
        const result = dashboardCtrl.postLiteral(idProject, idLiteral, req.body, true);
        if(result.code === 200) {
            setAlerts('SUCCESS', 'literal guardado.');
            res.redirect(`/projects/${idProject}`);
        } else {
            setAlerts('ERROR', 'literal no guardado.');
            error('[Error] set literal ', result);
        }
    })
    .get('/:idProject/export', async (req: any, res: any) => {
        const { idProject, idLiteral } = req.params;
        const resultExport = await dashboardCtrl.exportProjectToFiles(idProject);
        setAlerts('SUCCESS', 'Proyecto exportado.');
        res.redirect(`/projects/${idProject}`);
    });

export default router;
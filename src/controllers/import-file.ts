
import * as service from '../services/service';

export const importFile = async (req: any, res: any) => {
    let data = await service.getFileImport();

    return res.json(data);
};
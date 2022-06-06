import * as filesctrl from '../controllers/files';
import * as dbSrv from './db';
import * as utils from '../utils/utils';

export const init = async () => {
    let model: any;
    let readDir = filesctrl.readDir();
    if (readDir.length > 0) {
        let dataDir = await filesctrl.filesctrl(readDir);
        const dataFiles = await filesctrl.readFiles(dataDir);
        let result: any = dbSrv.saveData('projects', dataFiles);

        const dataProjects = dbSrv.getData();
        model = utils.getInfoDataToProjects(dataProjects);
    } else {
        model = {
            error: {
                status: true,
                message: '[API] - Carpeta IMPORT vacia'
            }
        };
    }


    return model;
};


export const getProjects = async (id: number) => {
    let result: any = dbSrv.getDataById(Number(id));

    return result;
};

export const setLiteral = (id: number, data: any) => {
    return dbSrv.setLiteral(id, data);
}

export async function getGeneralteJsonProjects(id: number) {
    const dataProject: any = await getProjects(id);
    const resultExportProject: any = await filesctrl.exportProjectToFile(dataProject);
    return 'siii';
}
export const getFileImport = async (typeFile?: string) => {
    const dataFile = await filesctrl.readFileImport(typeFile);
    return dataFile;
}


export const importOrigin = async () => {
    await dbSrv.init(true);
}

import * as scanFiles from '../utils/scan-files';
import * as dbServices from '../services/db-services';
import * as utils from '../utils/utils';

export const init = async () => {
    let model: any;
    let readDir = scanFiles.readDir();
    if (readDir.length > 0) {
        let dataDir = await scanFiles.scanFiles(readDir);
        const dataFiles = await scanFiles.readFiles(dataDir);
        let result: any = dbServices.saveData('projects', dataFiles);

        const dataProjects = dbServices.getData();
        model = utils.getInfoDataToProjects(dataProjects);
    } else {
        model = {
            error: {
                status: true,
                message: '[API] - Carpeta INPUT vacia'
            }
        };
    }


    return model;
};


export const getProjects = async (id: number) => {
    let result: any = dbServices.getDataById(Number(id));

    return result;
};

export const setLiteral = async (id: number, data: any) => {
    return dbServices.setLiteral(id, data);
}

export async function getGeneralteJsonProjects(id: number) {
    const dataProject: any = await getProjects(id);
    const resultExportProject: any = await scanFiles.exportProjectToFile(dataProject);
    return 'siii';
}
export const getFileImport = async () => {
    const dataFile = await scanFiles.readFileImport();
    return dataFile;
}


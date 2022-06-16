import _ from "lodash";
import { MODEL_FILE_DB } from "../constants";
import * as utils from '../utils/utils';

const lowDB = require('lowdb');
const fse = require('fs-extra');
const FileSync = require('lowdb/adapters/FileSync');

let db: any = null;

export const init = async () => {
    try {
        await fse.remove('./src/db/db-lowdb.json');
        console.log('[init] - BD antigua borrada');
        const adapter = new FileSync('./src/db/db-lowdb.json');
        setDB(lowDB(adapter));
        //const next = generateNextID('projects');

        //if (next.id === 0 && !next.isUpdate)
        db.defaults(MODEL_FILE_DB).write();
    } catch (err) {
        console.error(err)
    }

};

export const getDB = () => {
    return db;
};

export const setDB = (_db: any): any => {
    db = _db;
};

export const saveData = (nameObj: string, data: any): any => {
    setDataToDB(nameObj, data.projects);
};

export const getData = () => {
    return db.get('projects').value();
};
export const getDataById = (id: number) => {
    return db.get('projects').find({ 'id': id }).value();
};

export const getMenu = () => {
    return db.get('projects')
        .map('name');
};

// TODO: buscar projecto por name y localizar ultimo ID
const generateNextID = (nameObj: string, data?: any): any => {
    const lastItem = db.get(nameObj).takeRight(1).value()[0];
    const existProject = db.get(nameObj).find({ name: data.name }).value();
    const nextId = {
        id: 0,
        isUpdate: false
    };
    if (!_.isUndefined(lastItem) && !_.isUndefined(data) && !_.isUndefined(data.name) && existProject) {
        switch (nameObj) {
            case 'projects':
                if (existProject.name === data.name) {
                    //update
                    nextId.id = existProject.id;
                    nextId.isUpdate = true;
                }
                break;

            default:
                break;
        }
    } else {
        nextId.id = (_.isUndefined(lastItem)) ? 0 : lastItem.id + 1;
    }

    return nextId;
};

const setDataToDB = (nameObj: string, data: any) => {
    let nextId = {
        id: 1,
        isUpdate: false
    };
    const setData = (data: any) => {
        nextId = generateNextID(nameObj, data);
        if (nextId.isUpdate) {
            // update
            db.get(nameObj)
                .find({ id: nextId.id })
                .assign(data)
                .write();
            console.log('************** Dato Actualizado **************');
        } else {
            // new
            data.id = nextId.id;
            db.get(nameObj).push(data).write();
            console.log('************** Dato Guardado **************');
        }
    };

    if (_.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            setData(element);
        }
    } else {
        setData(data);
    }
};
export const setLiteral = (id: number, data: any) => {
    let result = { code: 204, message: 'error', data: null };

    if (data.isNew) {
        result = addNewLiteral(id, data);
    } else {
        const dataProject = getDataById(id);
        const dataLiteral = dataProject.literals.find((lit: any) => lit.id === data.id);

        if (dataLiteral) {
            dataLiteral.lang = data.lang;
            db.get('projects')
                .find({ 'id': id })
                .assign(dataProject)
                .write();
            console.log('************** Literal Actualizado **************');
            result = utils.dataResponse(200, 'Literal Actualizado', { idProject: id, literal: data });
        }
    }

    return result;
};

function addNewLiteral(id: number, data: any) {
    let result = { code: 204, message: 'error', data: null };
    const dataProject = db.get('projects').find({ id: id }).value();
    let existName = false;

    if (dataProject) {
        const lastId = dataProject.literals.length;

        dataProject.literals.forEach((literal: any) => {
            if(!existName) {
                existName = literal.name.includes(data.name);
            }
        });

        if(!existName) {
            dataProject.literals.push({
                id: lastId,
                lang: data.lang,
                name: data.name
            });
    
            db.get('projects')
                .find({ 'id': id })
                .assign(dataProject)
                .write();
            console.log('************** Literal Nuevo **************');
            result = utils.dataResponse(200, 'Literal Nuevo', { idProject: id, literal: data });
        } else {
            result = { code: 204, message: `Already exists name ${data.name} in project ${dataProject.name}`, data: null };
        }

        
    }

    return result;
}


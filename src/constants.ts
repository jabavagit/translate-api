import { modelProjects, Literal, Lang } from './interfaces/interfaces';

export const PROJECTS = [];
export const LANGS = ['ca', 'de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pt', 'ru', 'zh'];
export const FILES = [];
export const LANG: Lang = {
    CA: 'ca', 
    DE: 'de', 
    EN: 'en', 
    ES: 'es', 
    FR: 'fr', 
    IT: 'it', 
    JA: 'ja', 
    NL: 'nl', 
    PT: 'pt', 
    RU: 'ru', 
    ZH: 'zh'
};
export const URL_LANG: Lang = {
    CA: '', 
    DE: '', 
    EN: '', 
    ES: '', 
    FR: '', 
    IT: '', 
    JA: '', 
    NL: '', 
    PT: '', 
    RU: '', 
    ZH: ''
};

export const LITERAL: Literal = {
    id: 0,
    name: '',
    lang: {
        CA: '', 
        DE: '', 
        EN: '', 
        ES: '', 
        FR: '', 
        IT: '', 
        JA: '', 
        NL: '', 
        PT: '', 
        RU: '', 
        ZH: ''
    }
}



// //////////////////////////////////////////////////////////////////////////////////
export const PORT = {
    SERVER: 8000,
};
export const HOST = 'http://localhost';
export const DB_FILE = 'db.json';
export const URL_DB = `${HOST}:${PORT.SERVER}/db`;

export const MODEL_FILE_DB: modelProjects = {projects: []};
export const PATH = {
    INPUT: './input/literals/',
    IMPORT_FILE: './input/import/import-translates.json',
    INPUT_ABS: 'C:/Dev/jsonTranslate-lowdb/api/input/literals',
    DB: '/db/',
};

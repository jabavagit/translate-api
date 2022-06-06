import { IProjects, ILiteral, ILang, IFilters, IFiltersType, IFiltersCount } from './interfaces/interfaces';

export const PROJECTS = [];
export const LANGS_ARR = ['ca', 'de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pt', 'ru', 'zh'];
export const FILES = [];
export const LANGS_TYPES: any = {
    CA: ['CA', 'ESPCAT'],
    DE: ['DE', 'ESPDEU'],
    EN: ['EN', 'ESPENG'],
    ES: ['ES', 'ESP'],
    FR: ['FR', 'ESPFRA'],
    IT: ['IT', 'ESPITA'],
    JA: ['JA', 'ESPJPN'],
    NL: ['NL', 'ESPNLD'],
    PT: ['PT', 'ESPPTB'],
    RU: ['RU', 'ESPRUS'],
    ZH: ['ZH', 'CH', 'ESPCHS']
};
export const LANGS: ILang = {
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
export const URL_LANG: ILang = {
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

export const LITERAL: ILiteral = {
    id: 0,
    name: '',
    langs: {
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
};

export const FILTERS_TYPE: any = {
    ALL: 'all',
    MISSING: 'missing',
    UNTRANSLATED: 'untranslated'
};
export const FILTERS_COUNT: IFiltersCount = {
    all: {
        count: 0,
        active: false
    },
    missing: {
        count: 0,
        active: false
    },
    untranslated: {
        count: 0,
        active: false
    }
};

export const ALERTS: any = {
    INFO: 'alert-primary',
    SUCCESS: 'alert-success',
    WARNING: 'alert-warning',
    ERROR: 'alert-danger',
}



// //////////////////////////////////////////////////////////////////////////////////
export const PORT = {
    SERVER: 8000,
};
export const HOST = 'http://localhost';
export const DB_FILE = 'db-lowdb.json';
export const URL_DB = `./src/db`;

export const MODEL_FILE_DB = { 
    version: 1,
    createDate: '',
    projects: [] 
};
export const PATH = {
    IMPORT_URI: 'C:/URL/FOLDER/',
    IMPORT: './import/literals/',
    IMPORT_FILE: './import/excel/template-translate.xlsx',
    IMPORT_FILE_EXCEL: './export/excelToJson/excelToJson.json',
    DB: '/db/',
    EXPORT: './export',
    LITERALES:'/literales',
    EXPORT_URI: './export/literales'
};

import { IImportFile, ILang, ILiteral, IProject, IProjects } from '../interfaces/interfaces';
const fs = require('fs');
const fse = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');
const sortJson = require('sort-json');
import { FILES, LANGS, LANGS_ARR, LITERAL, MODEL_FILE_DB, PATH, PROJECTS, URL_LANG } from '../constants';
import { controlErrors, getLang } from '../utils/utils';
import _, { cloneDeep, values } from 'lodash';
import { info } from 'console';
import * as utils from '../utils/utils';
import * as XLSX from 'xlsx';
//var XLSX = require("xlsx");

const constants: any = {
    lang: LANGS,
    langs: LANGS,
    path: PATH,
    projects: PROJECTS,
    files: FILES,
    model: MODEL_FILE_DB
};
export const filesctrl = (filesDir: any) => {
    const _project: IProject = {};
    const _langs: ILang = {};
    let count = 0;
    const _urlLangs: any = _.cloneDeep(URL_LANG);
    let checkProject = '';
    const url_abs: string = PATH.IMPORT_URI;
    constants.model.projects = [];
    filesDir.forEach((url: string) => {
        //const split = url.split('/');
        const split_url: string[] = url.split(url_abs).filter(Boolean);
        const _split: string[] = split_url[0].split('/').filter(Boolean);
        let splitLang = [];

        if (_split.length === 2 && _split[1].includes('.json')) {
            if (_split[0] !== checkProject) {
                if (checkProject !== '') {
                    constants.model.projects.push(_.cloneDeep(_project));
                }
                checkProject = _split[0];
                constants.projects.push(_.cloneDeep(_split[0]));
                _project.id = count;
                _project.name = _split[0];
                _project.path = _urlLangs;
                count++;
            }

            if (_split[0] === checkProject) {
                splitLang = _split[1].split('.');
                if (typeof _urlLangs[splitLang[0].toLocaleUpperCase()] === 'string') {
                    _urlLangs[splitLang[0].toLocaleUpperCase()] = url;
                }
            }


        }
    });
    constants.model.projects.push(_.cloneDeep(_project));
    return constants.model;
};

export const readDir = (dir?: any) => {
    const _dir = dir ? dir : PATH.IMPORT_URI;
    var results: any[] = [];
    var list = fs.readdirSync(_dir);
    list.forEach(function (file: string) {
        file = _dir + file + '/';
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(readDir(file));
        } else {
            /* Is a file */
            results.push(file);
        }
    });
    constants.files = results;
    return results;
};
export const readFiles = async (dataDir: any) => {
    try {
        for (let i = 0; i < dataDir.projects.length; i++) {
            const project = dataDir.projects[i];
            let _isFirst = true;
            for (const lang in project.path) {
                if (Object.prototype.hasOwnProperty.call(project.path, lang)) {
                    const uri = project.path[lang];
                    const _lang: any = lang;
                    const jsonData = await fse.readJson(uri, { throws: false });
                    const jsonDataOrdered = Object.keys(jsonData).sort().reduce(
                        (obj: any, key: any) => {
                            obj[key] = jsonData[key];
                            return obj;
                        },
                        {}
                    );
                    const _literals: any = [];
                    let _literal: ILiteral = _.cloneDeep(LITERAL);
                    let count = 0;

                    for (const key in jsonDataOrdered) {
                        if (Object.prototype.hasOwnProperty.call(jsonDataOrdered, key)) {
                            const value = jsonDataOrdered[key];
                            if (_isFirst) {
                                _literal.id = count;
                                _literal.name = key;
                                _literal.langs[_lang] = value;
                                _literals.push(_.cloneDeep(_literal));
                                count++;
                            } else {
                                _literal = project.literals.find((elem: any) => elem.name === key);
                                if (_literal) {
                                    // update translate literal
                                    _literal.langs[_lang] = value;
                                } else {
                                    // no exist, and add new literal
                                    const newLiteral = _.cloneDeep(LITERAL);
                                    newLiteral.id = project.literals.length;
                                    newLiteral.name = key;
                                    newLiteral.langs[_lang] = value;
                                    project.literals.push(newLiteral);
                                }
                            }

                        }
                    }
                    if (_isFirst) {
                        _isFirst = false;
                        project.literals = _literals;
                    }
                }
            }
        }

        return dataDir;

    } catch (err) {
        console.error(err)
    }
}

export const exportProjectToFile = async (data: any): Promise<any> => {
    try {
        let url_ok: boolean = false;
        const path = _.cloneDeep(PATH.IMPORT);
        if (!fs.existsSync(PATH.EXPORT)) {
            fs.mkdirSync(PATH.EXPORT);
        }
        if (!fs.existsSync(PATH.EXPORT + PATH.LITERALES)) {
            fs.mkdirSync(PATH.EXPORT + PATH.LITERALES);
        }
        for (let i = 0; i < LANGS_ARR.length; i++) {
            const _lang = LANGS_ARR[i];
            let urlToLang: string = '';
            for (const key in data.path) {
                if (Object.prototype.hasOwnProperty.call(data.path, key) && key === _lang.toUpperCase() && typeof data.path[key] === 'string') {
                    const _url = data.path[key];
                    urlToLang = _url;
                }
            }

            if (urlToLang.split('literales').length > 0) {
                const dataFileExport: any = {};
                let endPath = PATH.EXPORT_URI + urlToLang.split('literales')[1];
                if (urlToLang.split('literales')[1].length > 0 && urlToLang.split('literales')[1][urlToLang.split('literales')[1].length - 1] !== '/') {
                    endPath = endPath + '/';
                }
                urlToLang = endPath
                for (let i = 0; i < data.literals.length; i++) {
                    const literal = data.literals[i];
                    dataFileExport[literal.name] = literal.langs[_lang.toUpperCase()];
                }
                await writeFileToDirExport(urlToLang, dataFileExport);
                url_ok = true;
            }

        }
        if (url_ok)
            console.log('[Export]: success!');
    } catch (error) {
        console.error('Error al borrar ' + error);
    }
};

const writeFileToDirExport = async (url: string, data: any) => {
    try {
        const _url = (url[url.length - 1] === '/') ? url.slice(0, -1) : url;
        //const result = await fse.outputJson(_url, JSON.stringify(_.cloneDeep(data), null, 4));
        const result = await fse.outputFile(_url, JSON.stringify(_.cloneDeep(data), null, 4));
        const options = { ignoreCase: true, reverse: false, depth: 1 };
        sortJson.overwrite(_url, options);
        console.log(`[Export] ${_url}`);

    } catch (error) {
        console.error(error);
    }
};


export const readFileImport = async (typeFile?: string) => {
    let result = { code: 204, message: 'error', data: null };
    const urlFile = typeFile && typeFile === 'excel' ? PATH.IMPORT_FILE_EXCEL : PATH.IMPORT_FILE;
    const jsonData = await fse.readJson(urlFile, { throws: false });

    // TODO: check data 
    const data: IImportFile[] = jsonData.translates;
    data.forEach((_literal) => {
        const _arrLangs: any = [];
        for (const key in _literal.langs) {
            if (Object.prototype.hasOwnProperty.call(_literal.langs, key)) {
                _arrLangs.push(key.toUpperCase());
            }
        }
        _literal.arrLangs = _arrLangs;
    });


    result = utils.dataResponse(200, 'Literal Nuevo', data);

    return result;
}

export const excel = () => {
    let arrTranslates: any = [];

    const literal: any = {
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
        },
        arrLangs: []
    };
    // Reading our test file
    //const file = XLSX.readFile('./import/excel/template-translate.xlsx');
    const file = XLSX.readFile('./import/excel/excel3.XLSX');
    let data: any = [];

    const sheets = file.SheetNames;

    for (let i = 0; i < sheets.length; i++) {
        const temp = XLSX.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]])
        temp.forEach((res) => {
            data.push(res);
        })
    }

    // Printing data
    data.forEach((object: any) => {
        const _literal = _.cloneDeep(literal);
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                let value: string = object[key];

                if (key.toUpperCase() === 'KEY') {
                    value = value.replace(" ", "_");
                    _literal.name = value.toUpperCase();
                } else {
                    const _lang = getLang(key.toUpperCase());
                    _literal.langs[_lang] = value;
                }
            }
        }
        _literal.arrLangs = LANGS_ARR.map((lang: string) => lang.toUpperCase());
        arrTranslates.push(_literal);
    });


    return arrTranslates;
}

export default filesctrl;
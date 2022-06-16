import { Lang, Literal, Project, modelProjects } from '../types/types';
const fs = require('fs');
const fse = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');
import { FILES, LANG, LANGS, LITERAL, MODEL_FILE_DB, PATH, PROJECTS, URL_LANG } from '../constants';
import { controlErrors } from './utils';
import _, { cloneDeep, values } from 'lodash';
import { info } from 'console';
import * as utils from '../utils/utils';

const constants: any = {
    lang: LANG,
    langs: LANGS,
    path: PATH,
    projects: PROJECTS,
    files: FILES,
    model: MODEL_FILE_DB
};
export const scanFiles = async (filesDir: any) => {
    const _project: Project = {};
    const _langs: Lang = {};
    let count = 0;
    const _urlLangs: any = _.cloneDeep(URL_LANG);
    let checkProject = '';
    const url_abs: string = PATH.INPUT;
    constants.model.projects = [];
    filesDir.forEach((url: string) => {
        //const split = url.split('/');
        const split_url: string[] = url.split(url_abs).filter(Boolean);
        const _split: string[] = split_url[0].split('/').filter(Boolean);
        let splitLang = [];

        if (_split.length === 2 && _split[1].includes('.json')) {
            if (_split[0] !== checkProject) {
                console.log(_split[0]);
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
    const _dir = dir ? dir : PATH.INPUT;
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
                    let _literal: Literal = _.cloneDeep(LITERAL);
                    let count = 0;

                    for (const key in jsonDataOrdered) {
                        if (Object.prototype.hasOwnProperty.call(jsonDataOrdered, key)) {
                            const value = jsonDataOrdered[key];
                            if (_isFirst) {
                                _literal.id = count;
                                _literal.name = key;
                                _literal.lang[_lang] = value;
                                _literals.push(_.cloneDeep(_literal));
                                count++;
                            } else {
                                _literal = project.literals.find((elem: any) => elem.name === key);
                                if (_literal) {
                                    // update translate literal
                                    _literal.lang[_lang] = value;
                                } else {
                                    // no exist, and add new literal
                                    const newLiteral = _.cloneDeep(LITERAL);
                                    newLiteral.id = project.literals.length;
                                    newLiteral.name = key;
                                    newLiteral.lang[_lang] = value;
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
        const path = _.cloneDeep(PATH.INPUT);
        try {
            rimraf(path.replace('input', 'output'), async () => {
                for (let i = 0; i < LANGS.length; i++) {
                    const _lang = LANGS[i];
                    let urlToLang: string = '';
                    for (const key in data.path) {
                        if (Object.prototype.hasOwnProperty.call(data.path, key) && key === _lang.toUpperCase() && typeof data.path[key] === 'string') {
                            const _url = data.path[key];
                            urlToLang = _url;
                        }
                    }

                    if (urlToLang.includes('input')) {
                        const dataFileExport: any = {};
                        urlToLang = urlToLang.replace('input', 'output')
                        for (let i = 0; i < data.literals.length; i++) {
                            const literal = data.literals[i];
                            dataFileExport[literal.name] = literal.lang[_lang.toUpperCase()];
                        }
                        console.log(dataFileExport);
                        await writeFileToDirExport(urlToLang, dataFileExport);
                    }

                }
                //const result = await fse.writeJson('./package.json', { name: 'fs-extra' });
                console.log('success! ' + 'result');
                return 'result';
            });
        } catch (error) {
            console.error('Error al borrar ' + error);
        }


    } catch (err) {
        console.error(err);
    }
};

const writeFileToDirExport = async (url: string, data: any) => {
    try {
        const _url = (url[url.length - 1] === '/') ? url.slice(0, -1) : url;
        //const result = await fse.outputJson(_url, JSON.parse(JSON.stringify(data)));
        const result = await fse.outputFile(_url, JSON.stringify(data, null, 4));
        console.log(_url);

    } catch (error) {
        console.error(error);
    }
};


export const readFileImport = async () => {
    let result = { code: 204, message: 'error', data: null };
    const jsonData = await fse.readJson(PATH.IMPORT_FILE, { throws: false });

    // TODO: check data 
    const data = jsonData.translates;

    result = utils.dataResponse(200, 'Literal Nuevo', data);

    return result;
}


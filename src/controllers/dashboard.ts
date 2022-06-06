import { getAlerts, resetAlert } from './../utils/utils';
import { IBreadcrumb, IFilters, IImportFile, ILiteral, IProject } from './../interfaces/interfaces';
import filesctrl, { excel, exportProjectToFile, readDir, readFiles } from "./files";
import * as dbSrv from "../services/db";
import * as srv from "../services/service";
import { IItemMenu, IHeader, IDashboard, IHome } from "../interfaces/interfaces";
import _ from "lodash";
import { FILTERS_TYPE, LANGS_ARR, LITERAL, URL_LANG } from '../constants';
import { execShellCommand, getInfoFiltersToProjects } from '../utils/utils';
import { log } from 'console';
import * as shelljs from 'shelljs'


let model: IHome;
let showAlerts: boolean;

export default init;
export const init = async () => {
    const title: string = 'Dashboard'
    const header: IHeader = {
        show: true,
        breadcrumb: []
    };
    const dashboard: IDashboard = {
        show: {
            project: false,
            formLiteral: false,
            import: false,
            menu: false,
            alerts: false
        },
        menu: []
    };

    const dataProjects = dbSrv.getData();
    const existDB: boolean = (dataProjects?.length > 0);
    const alerts = getAlerts();

    if (!existDB) {
        console.log('[init][db] - DB sin datos');
        console.log('[init][import] - Importando ficheros');
        let readDataDir = readDir();
        if (readDataDir.length > 0) {
            let dataDir = await filesctrl(readDataDir);
            const dataFiles = await readFiles(dataDir);
            let result: any = dbSrv.saveData('projects', dataFiles);

            dashboard.menu = getItemsMenu(dataProjects);
            dashboard.show.menu = (dashboard.menu.length > 0);
            header.show = (dashboard.menu.length > 0);
        } else {
            // TODO: control de errores
            console.warn('[init][import] - Carpeta vacia "./importar/literals/..."');
        }
    } else {
        console.log('[init][db] - DB con datos');
        dashboard.menu = getItemsMenu(dataProjects);
        dashboard.show.menu = (dashboard.menu.length > 0);
    }

    dashboard.alerts = alerts;
    dashboard.show.alerts = true;
    resetAlert();

    // Set data to model
    model = {
        title,
        header,
        dashboard,
    };

    return model;
};

export const getItemsMenu = (data: any): any => {
    const result: IItemMenu[] = [];

    data.forEach((project: IProject) => {
        let countM: number = 0;
        let countU: number = 0;

        _.forEach(project.literals, (_literal: ILiteral) => {
            const arrLangs = Object.keys(_literal.langs).map((name) => {
                let values = _literal.langs[name];
                return values;
            });
            countM = 0;
            countU = 0;
            _.forEach(arrLangs, (value: string) => {
                if (value === '') {
                    countU++;
                }

                if (value.length > 0) {
                    countM++;
                }
            });
        });

        result.push({
            id: project.id,
            name: project.name,
            countLiterals: project.literals?.length || 0
        });
    });

    return result;
};

export const getProject = (id: number, filter?: string) => {
    let _project: IProject = dbSrv.getDataById(Number(id));
    const typeFilter: string = (filter && FILTERS_TYPE[filter.toUpperCase()]) ? FILTERS_TYPE[filter.toUpperCase()] : FILTERS_TYPE.ALL;
    const alerts = getAlerts();

    if (model.dashboard) {
        model.dashboard.show.project = false;
        model.dashboard.show.formLiteral = false;
        model.dashboard.show.import = false;
        model.dashboard.project = undefined;
        model.dashboard.show.alerts = false;

        if (alerts?.show) {
            model.dashboard.alerts = alerts;
            model.dashboard.show.alerts = true;
            resetAlert();
        }
    }

    if (model.dashboard && _.isNumber(_project.id) && _.isString(_project.name) && _.isArray(_project.literals)) {
        model.dashboard.project = {
            id: _project.id,
            name: _project.name,
            literals: filterData(_project.literals, typeFilter),
            path: _project.path
        };
        model.dashboard.show.project = true;
        model.dashboard.project.filters = getInfoFiltersToProjects(_project, typeFilter);

        model.dashboard?.project?.literals?.sort((a: any, b: any) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

        getSetBreadCrumb({
            id: Number(_project.id),
            name: _project.name,
            url: `/projects/${_project.id}`,
            css: 'active',
            export: {
                show: true
            }
        });
    }

    return model;
};

const filterData = (literals: ILiteral[], typeFilter: string): ILiteral[] => {
    const filters: IFilters = {
        all: literals || [],
        missing: [],
        untranslated: []
    };
    let arrLiterals: ILiteral[] = [];

    for (const key in literals) {
        let count = 0;
        if (Object.prototype.hasOwnProperty.call(literals, key)) {
            const __literal: ILiteral = literals[key];
            let result = false;
            for (const key in __literal.langs) {
                if (Object.prototype.hasOwnProperty.call(__literal.langs, key) && __literal.langs[key].length === 0) {
                    result = true;
                    count++;
                }
            }

            if (result) {
                filters.missing.push(__literal);
            }

            if (count === Object.keys(__literal.langs).length) {
                filters.untranslated.push(__literal);
            }

            __literal.infoLangs = getInfoLang(_.cloneDeep(__literal.langs));
        }
    }


    switch (typeFilter) {
        case FILTERS_TYPE.MISSING:
        case FILTERS_TYPE.UNTRANSLATED:
            if (typeFilter === FILTERS_TYPE.MISSING && filters.missing.length > 0) {
                arrLiterals = filters.missing;
            } else if (typeFilter === FILTERS_TYPE.UNTRANSLATED) {
                if (filters.untranslated.length > 0) {
                    arrLiterals = filters.untranslated;
                }
            }
            break;

        case FILTERS_TYPE.ALL:
        default:
            arrLiterals = filters.all;
            break;
    }
    return arrLiterals;
};

const getInfoLang = (langs: any) => {
    const arrLangs = LANGS_ARR;
    const checkDataEmpty = (data: any): string => {
        let isAllSuccess = false;
        let countSuccess = 0;
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const element = data[key];
                if (element.includes('text-success')) {
                    countSuccess++;
                }
            }
        }
        if (Object.keys(langs).length === countSuccess) {
            isAllSuccess = true;
        }

        return isAllSuccess ? '' : data.join(',');
    };
    const result = arrLangs.map(lang => {
        lang = lang.toUpperCase();
        let res = '';
        for (const key in langs) {
            if (Object.prototype.hasOwnProperty.call(langs, key)) {
                const element = langs[key];
                if (lang === key && element.length > 0) {
                    res = `<span class="text-success">${lang}</span>`;
                }
            }
        }

        if (!res.includes('text-success')) {
            res = `<span class="text-danger">${lang}</span>`;
        }

        return res;
    });
    return checkDataEmpty(result);
}

export const getLiteral = (idProject: number | string, idLiteral: number | string, isNew?: boolean) => {
    const arrLangs = [];
    const _isNew = isNew ? isNew : false;
    const _project: IProject = dbSrv.getDataById(Number(idProject));
    let _literal: ILiteral = _.cloneDeep(LITERAL);
    if (!_isNew) {
        _literal = _project.literals?.find((literal: ILiteral) => {
            return literal.id === Number(idLiteral)
        });
    }

    if (!model.dashboard?.project) {
        getProject(Number(idProject));
    }

    if (model.dashboard && (_literal || _isNew)) {
        model.dashboard.show.formLiteral = true;
        model.dashboard.show.project = false;
        model.dashboard.formLiteral = {
            isNew: _isNew,
            literal: _literal,
            langs: [],
            selectLang: 'ES'
        };

        for (const key in _literal.langs) {
            if (Object.prototype.hasOwnProperty.call(_literal.langs, key)) {
                arrLangs.push(key);
            }
        }
        model.dashboard.formLiteral.langs = arrLangs;
    }


    return model;
}

export const postLiteral = (idProject: any, idLiteral: any, reqbody: any, isNew?: boolean) => {
    const _updateLangs: any = _.cloneDeep(URL_LANG);
    for (const key in reqbody) {
        if (Object.prototype.hasOwnProperty.call(reqbody, key)) {
            const value = reqbody[key];
            for (let i = 0; i < LANGS_ARR.length; i++) {
                const _lang = LANGS_ARR[i].toUpperCase();

                if (key.includes(_lang)) {
                    _updateLangs[_lang] = value;
                }
            }
        }
    }
    const _name = reqbody && reqbody.nameLiteral ? reqbody.nameLiteral.toUpperCase() : '';
    const data = {
        id: isNew ? 0 : Number(idLiteral),
        langs: _updateLangs,
        name: _name,
        isNew
    };
    return srv.setLiteral(Number(idProject), data);
}

export const exportProjectToFiles = async (idProject: number) => {
    const _model: IHome = getProject(idProject);
    const resultExportProject: any = await exportProjectToFile(_model.dashboard?.project);
    return _model;
}

export const importFile = async (type: string) => {
    let result: any = null;
    if (type === 'json') {
        result = await srv.getFileImport();
        if (result.code === 200 && model.dashboard && result.data) {
            model.dashboard.import = result.data;
            model.dashboard.show.import = true;
        }
        log(result);
    } else if (type === 'origin') {
        await srv.importOrigin();
    } else {
        try {
            result = excel();
            if (model.dashboard && result && result.length > 0) {
                model.dashboard.import = result;
                model.dashboard.show.import = true;
            }
        } catch (error) {
            log(error);
        }

    }

    getSetBreadCrumb({
        id: 0,
        name: 'Importar Excel',
        url: '',
        css: 'disabled',
        export: {
            show: false
        }
    });

    return model || {};
}

export const importForm = (reqBody: any) => {
    let dataImport: any = [];
    let arrResult: any = [];
    let arrIdsProjects: any = [];
    if (reqBody.importform && reqBody.importform.length > 0) {
        reqBody.importform.forEach((element: any) => {
            if (!arrIdsProjects.includes(element.idProject)) {
                arrIdsProjects.push(element.idProject);
            }
        });

        arrIdsProjects.forEach((_idProject: any) => {
            const model = getProject(_idProject);
            reqBody.importform.forEach((element: any) => {
                element.idProject = Number(element.idProject);
                if (model.dashboard?.project?.id === element.idProject && model.dashboard?.project?.literals && model.dashboard?.project?.literals.length > 0) {
                    const _literal: ILiteral = _.cloneDeep(LITERAL)
                    _literal.id = model.dashboard.project.literals.length;
                    _literal.name = element.nameLiteral;
                    _literal.langs = element.langs;
                    _literal.isNew = true;

                    arrResult.push(srv.setLiteral(element.idProject, _literal));
                }
            });
        });
    }
    return arrResult;
}

export const search = (search: string) => {
    const idProject: number | null = (model.dashboard?.project && _.isNumber(model.dashboard.project.id)) ? model.dashboard.project.id : null;
    const result: any = {
        idProject: idProject,
        literals: []
    };
    let resultFilters: ILiteral[] = [];
    let filterByKeys: ILiteral[];
    let filterByLangES: ILiteral[] | null = null;
    if (idProject !== null) {
        const _model: IHome = getProject(idProject);
        const _project: IProject | null = (_model.dashboard?.project) ? _model.dashboard?.project : null;
        if (_project?.literals) {
            filterByKeys = _project.literals.filter((element: ILiteral) => element.name.toUpperCase().includes(search.toUpperCase()));
            filterByLangES = _project.literals.filter((element: ILiteral) => element.langs.ES.toUpperCase().includes(search.toUpperCase()));
            if (filterByKeys) {
                resultFilters = filterByKeys;
            }
            if (filterByLangES) {
                resultFilters = _.union(resultFilters, filterByLangES);
            }
        }
    }
    result.literals = resultFilters;
    return result;
};

export const searchLiterals = (idProject: string, nameLiteral: string) => {
    const model = getProject(Number(idProject));
    const result = model.dashboard?.project?.literals?.find((literal) => literal.name === nameLiteral);
    return result;
};

export const getModel = () => { return model; };
export const getShowAlerts = () => { return showAlerts; };
export const setShowAlerts = (isShow: boolean) => { showAlerts = isShow; };

const getSetBreadCrumb = (item?: IBreadcrumb) => {
    const _item: IBreadcrumb | boolean = item ? item : false;

    if (_item) {
        _item.export.css = _item.export.show ? '' : 'd-none';
        model.header.breadcrumb = [_item];
    } else {
        return model.header.breadcrumb;
    }
};
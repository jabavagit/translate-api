'use strict';

const ExcelUtil = require('../utils/excelUtil');
const StringUtil = require('../utils/stringUtil');
const fs = require('fs');
const _ = require('lodash');

const COLUMN_IGNORE = '#';

const REG_EXP_FORMAT = /\$\$(?:(\w+)((?:;[\w\s#]+)*))\$/g;
const REG_EXP_VALUES = /\$(\d+)/g;
const REG_EXP_COLUMN_REF = /#[\w\s]+/g;

const DEFAULT_INPUT_FOLDER = './import';
const DEFAULT_LITERAL_FOLDER = 'excelToJson';
const DEFAULT_OUTPUT_FOLDER = './export';
const DEFAULT_HIERARCHY_CHAR = null;
const DEFAULT_USE_UNICODE_CODE = false;
const DEFAULT_PROJECT = 'iberia';
const DEFAULT_PROCESS_LOCALES = [];
const DEFAULT_EXCEL_FILE = "excel/template-translate.xlsx";

// Fichero que contiene las variables de configuracion.
let config = loadConfig();

(function () {

    if (!fs.existsSync(config.outputFolder)) {
        fs.mkdirSync(config.outputFolder);
    }
    if (!fs.existsSync(`${config.outputFolder}/${config.literalFolder}`)) {
        fs.mkdirSync(`${config.outputFolder}/${config.literalFolder}`);
    }

    // Lectura del excel.
    ExcelUtil.read(`${config.inputFolder}/${config.excelFile}`, process);
    // Funcion callback que se ejecuta si la apertura del excel y su
    // transformacion a nuestro WorkBook ha ido correctamente.
    function process(workbook) {
        let sheet = workbook.getSheet(0);
        let tableNames = Object.getOwnPropertyNames(sheet.tables);

        let languages = [];
        let configColumns = {};
        let locales = {};
        let keyColumn;

        let objAccess;
        let firstRow;
        if (tableNames.length === 0) {
            keyColumn = 1;

            for (let i = 2; i <= sheet.numColumns; i++) {
                let langName = sheet.getData(1, i).toLowerCase();
                if (config.processLocales == null || config.processLocales.length === 0 || config.processLocales.indexOf(langName) !== -1) {
                    if (langName.startsWith(COLUMN_IGNORE)) {
                        configColumns[langName] = i;
                    } else {
                        languages.push({
                            name: langName,
                            access: i
                        });
                        locales[langName] = {};
                    }
                }
            }

            objAccess = sheet;
            firstRow = 2;

        } else {

            let table = sheet.getTable(tableNames[0]);
            objAccess = table;

            keyColumn = table.columnData.table.indexToName[0];
            for (let i = 1; i < table.columnData.numColumns; i++) {
                let lang = table.columnData.table.indexToName[i];
                let langName = lang.toLowerCase();
                if (config.processLocales == null || config.processLocales.length === 0 || config.processLocales.indexOf(langName) !== -1) {

                    if (langName.startsWith(COLUMN_IGNORE)) {
                        configColumns[langName] = lang;
                    } else {
                        languages.push({
                            name: langName,
                            access: lang
                        });
                        locales[langName] = {};
                    }
                }
            }

            firstRow = 1;
        }

        languages.forEach(function (lang) {
            let currentLangJsonPath = `${config.inputFolder}/${config.literalFolder}/${lang.name}.json`;
            let currentLangJson = {};
            if (fs.existsSync(currentLangJsonPath)) {
                currentLangJson = JSON.parse(fs.readFileSync(currentLangJsonPath));
            }

            locales[lang.name] = currentLangJson;
        });

        for (let numRow = firstRow; numRow <= objAccess.numRows; numRow++) {

            let key = objAccess.getData(numRow, keyColumn);
            let hierarchy = [key];
            if (config.hierarchyChar) {
                hierarchy = key.split(config.hierarchyChar);
            }

            languages.forEach(function (lang) {
                let translate = objAccess.getData(numRow, lang.access);

                let localeObj = locales[lang.name];
                for (let hierarchyIndex = 0; hierarchyIndex < hierarchy.length - 1; hierarchyIndex++) {
                    let hierarchyName = hierarchy[hierarchyIndex];

                    if (localeObj[hierarchyName] === undefined) {
                        localeObj[hierarchyName] = {};
                    }

                    localeObj = localeObj[hierarchyName];
                }

                translate = formatHtml(translate, lang.name, numRow, objAccess, configColumns);

                if (config.useUnicodeCode) {
                    localeObj[hierarchy[hierarchy.length - 1]] = StringUtil.toUnicode(translate);
                } else {
                    localeObj[hierarchy[hierarchy.length - 1]] = translate;
                }
            });
        }


        const dataJson = {
            translates: []
        };

        let arrTranslates = [];

        //languages.forEach(function (lang) {
            const literal = {
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

            let isFirst = true;

            for (const key in locales) {
                if (Object.hasOwnProperty.call(locales, key)) {
                    const element = locales[key];
                    const _literal = _.cloneDeep(literal);
                    for (const key2 in element) {
                        if (Object.hasOwnProperty.call(element, key2)) {
                            const text = element[key2];
                            if (isFirst) {
                                _literal.name = key2;
                                _literal.langs[key.toUpperCase()] = text;
                                arrTranslates.push(_.cloneDeep(_literal));
                            } else {
                                const _updateLiteral = arrTranslates.find((item) => { return item.name === key2 });
                                _updateLiteral.langs[key.toUpperCase()] = text;
                            }
                        }
                    }
                    isFirst = false;
                }
            }

        //});
        let outputPath = `${config.outputFolder}/${config.literalFolder}/${config.literalFolder}.json`;
        dataJson.translates = arrTranslates;
        const translatesStr = JSON.stringify(dataJson, null, 4);
        fs.writeFileSync(outputPath, translatesStr, { flag: "w" });
    }
}).apply(null, process.argv);

function loadConfig() {
    let config = {
        "project": DEFAULT_PROJECT,
        "inputFolder": DEFAULT_INPUT_FOLDER,
        "literalFolder": DEFAULT_LITERAL_FOLDER,
        "outputFolder": DEFAULT_OUTPUT_FOLDER,
        "hierarchyChar": DEFAULT_HIERARCHY_CHAR,
        "useUnicodeCode": DEFAULT_USE_UNICODE_CODE,
        "processLocales": DEFAULT_PROCESS_LOCALES,
        "excelFile": DEFAULT_EXCEL_FILE
    };

    if (config.useUnicodeCode === null || config.useUnicodeCode === undefined) {
        config.useUnicodeCode = DEFAULT_USE_UNICODE_CODE;
    }

    return config;
}

RegExp.prototype.execAll = function (str) {
    let result = [];

    let match;
    while ((match = this.exec(str)) !== null) {
        result.push(match);
    }

    return result;
};

function formatHtml(str, lang, numRow, objAccess, configColumns) {
    if (!config.tags) {
        return str;
    }

    let matches = REG_EXP_FORMAT.execAll(str);

    for (let i = matches.length - 1; i >= 0; i--) {
        let match = matches[i];
        let iniContentIx = match.index + match[0].length;
        let endContentIx = str.indexOf('$', iniContentIx);

        let prevContent = str.substring(0, match.index);
        let postContent = str.substring(endContentIx + 1);
        let content = str.substring(iniContentIx, endContentIx);

        let type = match[1];
        let params = match[2].split(';').filter(x => x !== '');

        if (config.tags[type] && config.tags[type].tag) {

            let tagConfig = config.tags[type];
            let attributes = [];

            for (let attr in tagConfig.attributes) {
                let value = tagConfig.attributes[attr];
                value = value.replace(REG_EXP_VALUES, function (match, paramIx) {
                    let param = params[paramIx];
                    if (!param) {
                        return '';
                    }

                    param = param.replace(REG_EXP_COLUMN_REF, function (columnRef) {
                        columnRef = columnRef.toLowerCase();
                        let access = configColumns[columnRef];
                        if (!access) {
                            return '';
                        }

                        let data = objAccess.getData(numRow, access);
                        data = data.replace('[lang]', lang);

                        return data;
                    });

                    return param || '';
                })

                attributes.push(`${attr}="${value.trim()}"`);
            }
            let openTag = `<${tagConfig.tag}`;
            if (attributes.length !== 0) {
                openTag = openTag + ' ' + attributes.join(' ');
            }

            let closeTag = `>${content}</${tagConfig.tag}>`;
            if (tagConfig.selfClosing) {
                closeTag = ' />';
            }

            let html = openTag + closeTag;
            str = prevContent + html + postContent;
        } else {
            str = prevContent + content + postContent;
        }
    }

    return str;
}
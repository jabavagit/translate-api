import { IMPORT_MOCK_DIR, IMPORT_DIR } from '@config';
import * as fs from 'fs';
import _ from 'lodash';
import * as path from 'path';

const pathImport: string = IMPORT_DIR && IMPORT_DIR.length > 0 ? IMPORT_DIR : IMPORT_MOCK_DIR;

export const readFolders = (_folder?: string): any => {
  let result: any[] = [];
  let directoryPath = pathImport; //path.join(__dirname, pathImport);
  const arrFolders: any[] = [];
  const arrFiles: any[] = [];
  if (_folder) {
    directoryPath = `${directoryPath}/${_folder}`;
  }

  if (fs.existsSync(directoryPath)) {
    const readDir = fs.readdirSync(directoryPath, { withFileTypes: true });
    readDir.forEach((item, index) => {
      if (fs.statSync(`${directoryPath}/${item.name}`).isDirectory()) {
        arrFolders.push({
          id: index,
          name: item.name,
        });
        result = arrFolders;
      } else {
        arrFiles.push(item.name);
        result = arrFiles;
      }
    });

    return result;
  }
};

export const readFiles = (idProjects: number[], model: any) => {
  let result: any = [];
  let countId = 0;

  idProjects.forEach((id: number) => {
    for (const key in model) {
      if (Object.prototype.hasOwnProperty.call(model, key)) {
        const _project = model[key];
        if (_project.id === id && _project.files) {
          const data: any = readFilesJson(_project);
          //result.push(data);
          result = [...result, ...data];
        }
      }
    }
  });

  result.forEach((element: any) => {
    element.id = countId;
    countId++;
  });

  return result;
};

export const readFilesJson = (_project: any) => {
  const url: any = _.cloneDeep(pathImport);
  let model: any = [];

  _project.files.forEach((file: any) => {
    const pathUrl: string = path.join(__dirname, `${url}/${_project.name}/${file}`);
    if (pathUrl.includes('.json') && fs.existsSync(pathUrl)) {
      const rawdata: any = fs.readFileSync(pathUrl);
      const dataFile = setDataJsonToModel(_project, JSON.parse(rawdata), pathUrl);
      model = [...model, ...dataFile];
    }
  });

  return model;
};

const setDataJsonToModel = (project: any, data: any, url: string) => {
  const modelFiles: any = {
    id: 0,
    idProject: 0,
    nameProject: '',
    url: '',
    lang: '',
    nameLiteral: '',
    valueLiteral: '',
    order: 0,
  };
  const result = [];
  let order = 0;

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const _value = data[key];
      const _model = _.cloneDeep(modelFiles);
      _model.idProject = project.id;
      _model.nameProject = project.name;
      _model.url = url;
      _model.nameLiteral = key;
      _model.valueLiteral = _value;
      _model.order = order;
      const urlSplit = url.split('\\');
      if (urlSplit && urlSplit.length > 0) {
        const nameFileLang = urlSplit[urlSplit.length - 1];
        const langSplit = nameFileLang?.split('.');
        _model.lang = langSplit && langSplit.length > 0 ? langSplit[0] : '';
      }
      order++;
      result.push(_model);
    }
  }

  return result;
};

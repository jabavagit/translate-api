import { logger } from '@utils/logger';
import * as fs from 'fs';
import _ from 'lodash';
import * as path from 'path';
import dbService from '@services/db.service';

const folder_import = '../import/literales';

export const readFolders = (_folder?: string) => {
  let result: any[] = [];
  let directoryPath = path.join(__dirname, folder_import);
  const arrFolders: any[] = [];
  const arrFiles: any[] = [];
  if (_folder) {
    directoryPath = `${directoryPath}\\${_folder}`;
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

export const redFilesAndSetDB = (idProjects: number[], model) => {
  const result = [];
  idProjects.forEach((id: number) => {
    for (const key in model) {
      if (Object.prototype.hasOwnProperty.call(model, key)) {
        const _project = model[key];
        if (_project.id === id && _project.files) {
          const data = readFilesJson(_project);
          result.push(data);
        }
      }
    }
  });

  return result;
};

export const readFilesJson = (_project: any) => {
  let url = _.cloneDeep(folder_import);
  let model = null;

  _project.files.forEach(file => {
    url = path.join(__dirname, `${url}/${_project.name}/${file}`);
    if (url.includes('.json') && fs.existsSync(url)) {
      const rawdata: any = fs.readFileSync(url);
      model = setDataJsonToModel(_project, JSON.parse(rawdata), url);
    }
  });

  return model;
};

const setDataJsonToModel = (project: any, data: any, url: string) => {
  const modelFiles = {
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
      order++;

      result.push(_model);
    }
  }

  return result;
};

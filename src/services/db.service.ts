import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import _ from 'lodash';

class DbServices {
  static setDataJson(_project: any, arg1: any, url: string) {
    throw new Error('Method not implemented.');
  }
  public setDataJson = (project: any, data: any, url: string) => {
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

    console.log(result);
  };


}

export default DbServices;

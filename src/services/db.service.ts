/* eslint-disable prettier/prettier */
import { Project } from '@/types/api.type';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import _ from 'lodash';
//import { LowSync, JSONFileSync } from 'lowdb';
const FileSync = require('lowdb/adapters/FileSync');
const lowDB = require('lowdb');
import * as path from 'path';

class DbServices {
  private file_DB = '../db/db-lowdb.json';
  private db: any;
  private model_db = {
    version: 2,
    createDate: '',
    projects: [],
  };

  public init = () => {
    const url = path.join(__dirname, this.file_DB);
    const adapter = new FileSync(url);
    this.db = lowDB(adapter);
    this.model_db.createDate = new Date().toJSON();
    this.db.defaults(this.model_db).write();
  };

  public setDataFiles = (data: any) => {
    this.db.get('projects').assign(data).write();
  };

  public getProject = (idProject?: number): Project[] => {
    return this.db.get('projects').filter({ 'idProject': idProject }).value();
  };
}

export default DbServices;

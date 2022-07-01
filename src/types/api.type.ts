import { Router } from 'express';

export type Routes = {
  path?: string;
  router: Router;
};

export type Files = {
  id: number;
  name: string;
  files?: string[];
};

export type Project = {
  id: number;
  idProject: number;
  nameProject: string;
  url: string;
  lang: string;
  nameLiteral: string;
  valueLiteral: string;
  order: number;
};

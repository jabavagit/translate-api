import { Files } from '@/interfaces/files.interface';
export default filesModel;
export const filesModel: Files[] = [{ id: 0, name: 'Proyect-1' }];
export const setProjectsModel = (id, name) => {
  return { id: id, name: name };
};
export const setFilesToProjectModel = (nameProject, model, data) => {
  for (const key in model) {
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      const _project = model[key];
      if (_project.name === nameProject) {
        _project.files = data;
      }
    }
  }
};

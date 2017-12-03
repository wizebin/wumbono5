import _ from 'underscore';

const MAX_RECURSION = 2000;

export default class File {
  constructor({ parent, name, open, type, meta, subfiles } = {}) {
    this.name = name;
    this.type = type;
    this.meta = meta;
    this.parent = parent;
    this.open = open;
    this.subfiles = (_.keys(subfiles) || []).reduce((culm, key) => {
      culm[key] = subfiles[key] instanceof File ? subfiles[key] : new File(subfiles[key]);
      culm[key].parent = this;
      return culm;
    }, {});
    if (!this.type) {
      if (!_.isEmpty(subfiles)) {
        this.type = 'folder';
      } else {
        this.type = 'file';
      }
    }
  }

  isFolder() {
    return this.type === 'folder';
  }

  isOpen() {
    return !!this.open;
  }

  toggleOpen() {
    this.open = !this.open;
  }

  setParent(folder) {
    if (this.parent) {
      this.parent.deleteChild(this.name);
    }
    folder.addChild(this);
  }

  deleteChild(filename) {
    if (_.has(this.subfiles, filename)) {
      this.subfiles[filename].parent = null;
      delete this.subfiles[filename];
    }
  }

  addChild(file) {
    this.subfiles[file.name] = file;
    this.subfiles[file.name].parent = this;
  }

  getChild(path) {
    const pathParts = path.split('.');
    let subsub = this;
    pathParts.forEach((nextPart) => {
      if (subsub) {
        if (_.has(subsub, 'subfiles') && _.has(subsub['subfiles'], nextPart)) {
          subsub = subsub['subfiles'][nextPart];
        } else {
          subsub = undefined;
        }
      }
    });
    return subsub;
  }

  getPath() {
    const pathnames = [];
    let obj = this;
    for(var a = 0; a < MAX_RECURSION && !!obj; a++) {
      if (obj.name) {
        pathnames.unshift(obj.name);
      }
      obj = obj.parent;
    }
    return pathnames.join('.');
  }
}

export function createFileObject(object, path, pathKey, value) {
  if (path === null || path === undefined || path === '') {
    path = pathKey;
  } else {
    path += '.' + pathKey;
  }

  let subObject = object;

  const paths = (path || '').split('.').forEach((key, dex, ray) => {
    if (key === '') {

    } else {
      if (subObject['subfiles'] === undefined) {
        subObject['subfiles'] = { };
        subObject.type = 'folder';
      }
      if (subObject['subfiles'][key] === undefined) {
        subObject['subfiles'][key] = { name: key };
      }

      if (dex !== ray.length - 1) {
        subObject = subObject['subfiles'][key];
      } else {
        subObject['subfiles'][key] = value;
      }
    }
  });

  return object
}
export function set(object, path, value) {
  let subObject = object;
  (path || '').split('.').forEach((key, dex, ray) => {
    if (key !== '') {
      if (dex !== ray.length - 1) {
        if (subObject[key] === undefined) {
          subObject[key] = {};
        }
        subObject = subObject[key];
      } else {
        subObject[key] = value;
      }
    }
  });

  return object;
}

export function setKey(object, path, key, value) {
  if (path === null || path === undefined || path === '') {
    path = key;
  } else {
    path += '.' + key;
  }
  return set(object, path, value);
}

export function setWithSubkey(object, path, subkey, value) {
  let subObject = object;
  (path || '').split('.').forEach((key, dex, ray) => {
    if (key !== '') {
      if (dex !== ray.length - 1) {
        if (subObject[subkey] === undefined) {
          subObject[subkey] = { [key]: {  } };
        }
        subObject = subObject[subkey][key];
      } else {
        if (subObject[subkey] === undefined) {
          subObject[subkey] = { [key]: {  } };
        }
        subObject[subkey][key] = value;
      }
    }
  });

  return object;
}

export function setKeyWithSubkey(object, path, subkey, key, value) {
  if (path === null || path === undefined || path === '') {
    path = key;
  } else {
    path += '.' + key;
  }
  return setWithSubkey(object, path, subkey, value);
}
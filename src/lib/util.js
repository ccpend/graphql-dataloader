import { isObject, isArray } from 'lodash-es/lang';

/**
 * 生存随机的ID
 * @param length
 * @return {string}
 */
export const makeRandomId = length => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

/**
 * 深度的搜寻对象并且对其进行修改
 * @param object
 * @param key
 * @param value
 * @param handler
 * @return {*}
 */
export const deepFindHandle = (object, key, value, handler) => {
  if (isArray(object)) {
    object.forEach((item, index)=> {
      object[index] = deepFindHandle(item, key, value, handler);
    });
  } else if (isObject(object)) {
    Object.keys(object).forEach(k => {
      object[k] = deepFindHandle(object[k], key, value, handler);
    });

    if (object[key] === value) {
      object = handler({ ... object });
    }
  }

  return object;
};

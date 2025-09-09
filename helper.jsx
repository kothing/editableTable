/**
 * 是否普通对象{}
 * @param {*} value
 * @returns boolean
 */
export const isPlainObject = (value) => {
  return Object.prototype.toString.call(value) === "[object Object]";
};

/**
 * 是否JSON字符串
 * 用于判断是否可以使用JSON.parse()方法
 * @param {string} strObj
 * @returns boolean
 */
export const isJsonString = (strObj) => {
  try {
    JSON.parse(strObj);
    return true;
  } catch (e) {
    return false;
  }
};

// 唯一标识符id
export const getGUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

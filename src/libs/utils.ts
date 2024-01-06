import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { pick } from 'lodash';

import { CACHE_TIME } from './constants';

export const random = () => crypto.randomBytes(128).toString('base64');
export const hash = async (password: string) => {
  return await argon2.hash(password);
};
export const compare = async (password: string, hash: string) => {
  return await argon2.verify(hash, password);
};
export const updateNestedObject = (obj: Record<string, any>) => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const nestedObj = updateNestedObject(obj[key]);
      Object.keys(nestedObj).forEach((nestedKey) => {
        newObj[`${key}.${nestedKey}`] = nestedObj[nestedKey];
      });
    } else {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
export const removeUndefinedFields = (obj: Record<string, any>) => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};
export const createTokenPair = (payload: Record<string, any>, publicKey: string, privateKey: string) => {
  try {
    // access token
    const accessToken = jwt.sign(payload, privateKey, {
      expiresIn: '1 days',
      algorithm: 'RS256'
    });
    // refresh token
    const refreshToken = jwt.sign(payload, privateKey, {
      expiresIn: '3 days',
      algorithm: 'RS256'
    });
    jwt.verify(accessToken, publicKey, (err) => {
      if (err) console.error(err);
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
export const getInfoData = (options: { fields: string[]; object: Record<string, any> }) => {
  const { fields, object } = options;
  return pick(object, fields);
};
export const getSelectData = (select: string[]): Record<string, 1> => {
  return Object.fromEntries(select.map((field) => [field, 1]));
};
export const getUnSelectData = (unselect: string[]): Record<string, 0> => {
  return Object.fromEntries(unselect.map((field) => [field, 0]));
};
export const strToArr = (str: string) => {
  const set = new Set<string>();
  const strArr = str
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  strArr.forEach((item) => set.add(item));
  return Array.from(set);
};
export const randomCacheTime = () => {
  return Math.floor(Math.random() * CACHE_TIME) + 100;
};

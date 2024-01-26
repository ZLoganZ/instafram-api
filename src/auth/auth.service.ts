import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

import { compare, createTokenPair, getInfoData } from '@/libs/utils';
import { IKeyModel, Key } from '@/auth/schema/key.schema';
import { LoginDto, RegisterDTO } from '@/auth/dto';
import { IUserModel, User } from '@/user/schema/user.schema';
import { sendMailForgotPassword, sendMailVerifyEmail } from '@/libs/mail_sender';

interface Cache {
  email: string;
  code: string;
  expireAt: number;
  timestamp: number;
  verified?: boolean;
}

const cache: Record<string, Cache> = {};
const getCache = (key: string) => cache[key];
const setCache = (key: string, value: Cache) => (cache[key] = value);
const delCache = (key: string) => delete cache[key];

const generateCache = (email: string) => {
  const code = crypto.randomInt(100000, 999999).toString();
  const timestamp = Date.now();
  const expireAt = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
  return { email, code, expireAt, timestamp };
};

const storeCache = (email: string) => {
  const cache = generateCache(email);
  setCache(email, cache);
  setTimeout(() => delCache(email), 10 * 60 * 1000); // 10 minutes in milliseconds
  return cache.code;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Key.name) private keyModel: IKeyModel,
    @InjectModel(User.name) private userModel: IUserModel
  ) {}

  async checkEmailSignup(email: string) {
    // Check if email is exist
    const user = await this.userModel.getUserByEmail(email);
    if (user) throw new BadRequestException('Email is already exist');

    const cacheEmail = getCache(email);
    if (cacheEmail) delCache(email);

    // Store email in cache
    const code = storeCache(email);

    // Send email
    sendMailVerifyEmail(email, code);

    // Return success message
    return { isRegistered: false };
  }

  async checkEmailForgotPassword(email: string) {
    // Check if email is exist
    const user = await this.userModel.getUserByEmail(email);
    if (!user) throw new BadRequestException('Email is not exist');

    const cacheEmail = getCache(email);
    if (cacheEmail) delCache(email);

    // Store email in cache
    const code = storeCache(email);

    // Send email
    sendMailForgotPassword(email, code);

    // Return success message
    return { isRegistered: true };
  }

  async verifyCode(email: string, code: string) {
    // Check if email is in cache
    const cacheEmail = getCache(email);
    if (!cacheEmail) throw new BadRequestException('Email is not exist');

    // Check if code is correct
    if (cacheEmail.code !== code) throw new BadRequestException('Code is not correct');

    // Check if code is expired
    if (cacheEmail.expireAt < Date.now()) throw new BadRequestException('Code is expired');

    // Delete email in cache
    delCache(email);

    // Return success message
    return { verified: true };
  }

  async resetPassword(payload: LoginDto) {
    const { email, password } = payload;

    // Check if email is exist
    const user = await this.userModel.getUserByEmail(email);
    if (!user) throw new BadRequestException('Email is not exist');

    const hashPassword = await argon2.hash(password);

    // Update password
    const updatedUser = await this.userModel.updateUser(user.id, { password: hashPassword });
    if (!updatedUser) throw new BadRequestException('Something went wrong');

    // Return success message
    return { resetPassword: true };
  }

  async login(payload: LoginDto) {
    const { email, password } = payload;

    // Check if email is exist
    const user = await this.userModel.getUserByEmail(email);
    if (!user) throw new BadRequestException('Email is not exist');

    // Check if password is correct
    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Password is incorrect');

    // Generate access token
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Generate token pair
    const tokens = createTokenPair({ _id: user._id, email: user.email }, publicKey, privateKey);

    // Save token pair
    const key = await this.keyModel.createKeyToken(user.id, publicKey, privateKey, tokens.refreshToken);
    if (!key) throw new BadRequestException('Something went wrong');

    // Return token pair
    return {
      user: getInfoData({
        fields: ['_id', 'name', 'email', 'image', 'bio'],
        object: user
      }),
      tokens
    };
  }

  async register(payload: RegisterDTO) {
    const { name, email, password, alias } = payload;

    // Check if alias is exist
    const userAlias = await this.userModel.getUserByAlias(alias);
    if (userAlias) throw new BadRequestException('Alias is already used');
    // Check if email is exist
    const user = await this.userModel.getUserByEmail(email);
    if (user) throw new BadRequestException('Email is already exist');

    const hashPassword = await argon2.hash(password);

    // Create user
    const newUser = await this.userModel.createUser({
      name,
      email,
      password: hashPassword,
      alias
    });
    if (!newUser) throw new BadRequestException('Something went wrong');

    // Generate access token
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Generate token pair
    const tokens = createTokenPair({ _id: newUser._id, email: newUser.email }, publicKey, privateKey);

    // Save token pair
    const key = await this.keyModel.createKeyToken(newUser.id, publicKey, privateKey, tokens.refreshToken);
    if (!key) throw new BadRequestException('Something went wrong');

    // Return token pair
    return {
      user: getInfoData({
        fields: ['_id', 'name', 'email', 'image', 'bio'],
        object: newUser
      }),
      tokens
    };
  }

  async logout(payload: { refreshToken: string }) {
    const { refreshToken } = payload;

    // Check if refresh token is exist
    const key = await this.keyModel.findByRefreshToken(refreshToken);
    if (!key) throw new BadRequestException('Refresh token is not exist');

    // Delete refresh token
    const removeToken = await this.keyModel.removeRefreshToken(key._id, refreshToken);
    if (!removeToken) throw new BadRequestException('Something went wrong');

    // Return success message
    return { logout: true };
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Schema as SchemaMongoose, Types } from 'mongoose';

import { User } from '@/user/schema/user.schema';

export type KeyDocument = Key & Document;

export interface IKeyModel extends Model<KeyDocument> {
  findByRefreshTokenUsed(refreshToken: string): Promise<KeyDocument>;
  findByRefreshToken(refreshToken: string): Promise<KeyDocument>;
  findByUserID(userID: string | Types.ObjectId): Promise<KeyDocument>;
  removeRefreshToken(keyID: string | Types.ObjectId, refreshToken: string): Promise<KeyDocument>;
  createKeyToken(
    userID: string | Types.ObjectId,
    publicKey: string,
    privateKey: string,
    refreshToken: string
  ): Promise<KeyDocument>;
}

@Schema({
  timestamps: true,
  statics: {
    async findByRefreshTokenUsed(refreshToken: string) {
      return await this.findOne({
        refreshTokensUsed: refreshToken
      }).lean();
    },
    async findByRefreshToken(refreshToken: string) {
      return await this.findOne({ refreshToken }).lean();
    },
    async findByUserID(userID: string | Types.ObjectId) {
      return await this.findOne({ user: userID }).lean();
    },
    async removeRefreshToken(keyID: string | Types.ObjectId, refreshToken: string) {
      return await this.findByIdAndUpdate(
        keyID,
        { $push: { refreshTokensUsed: refreshToken }, refreshToken: null },
        { new: true }
      ).lean();
    },
    async createKeyToken(
      userID: string | Types.ObjectId,
      publicKey: string,
      privateKey: string,
      refreshToken: string
    ) {
      const update = {
        publicKey,
        privateKey,
        refreshToken
      };

      const tokens = await this.findOneAndUpdate({ user: userID }, update, {
        upsert: true,
        new: true
      }).lean();
      return tokens;
    }
  }
})
export class Key {
  @Prop({
    type: SchemaMongoose.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  })
  user: User;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  privateKey: string;

  @Prop({ type: [String], index: true, default: [] })
  refreshTokensUsed: string[];

  @Prop({ required: true })
  refreshToken: string;
}

export const KeySchema = SchemaFactory.createForClass(Key);

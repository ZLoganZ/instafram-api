import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, Schema as SchemaMongoose, Types } from 'mongoose';

import { Post } from '@/post/schema/post.schema';
import { getSelectData } from '@/libs/utils';
import { selectUserPopulateArr } from '@/libs/constants';

export type UserDocument = User & Document;

export interface IUserModel extends Model<UserDocument> {
  getUsers(): Promise<UserDocument[]>;
  getUserByEmail(email: string): Promise<UserDocument>;
  getUserByAlias(alias: string): Promise<UserDocument>;
  getUserByID(id: string | Types.ObjectId): Promise<UserDocument>;
  createUser(values: Record<string, any>): Promise<UserDocument>;
  deleteUser(id: string | Types.ObjectId): Promise<UserDocument>;
  updateUser(id: string | Types.ObjectId, values: Record<string, any>): Promise<UserDocument>;
  getTopCreators(page: string): Promise<UserDocument[]>;
  searchUsers(query: string, page: string): Promise<UserDocument[]>;
  getFollowingsByUserID(userID: string): Promise<UserDocument[]>;
  getFollowersByUserID(userID: string): Promise<UserDocument[]>;
}

@Schema({
  timestamps: true,
  statics: {
    async getUsers(this: IUserModel) {
      return this.find().lean();
    },
    async getUserByEmail(this: IUserModel, email: string) {
      return await this.findOne({ email }).select('+password').lean();
    },
    async getUserByAlias(this: IUserModel, alias: string) {
      return await this.findOne({ alias }).lean();
    },
    async getUserByID(this: IUserModel, id: string | Types.ObjectId) {
      return await this.findById(id).lean();
    },
    async createUser(this: IUserModel, values: Record<string, any>) {
      return await this.create(values);
    },
    async deleteUser(this: IUserModel, id: string | Types.ObjectId) {
      return await this.findByIdAndDelete(id).lean();
    },
    async updateUser(this: IUserModel, id: string | Types.ObjectId, values: Record<string, any>) {
      return await this.findByIdAndUpdate(id, values, { new: true }).lean();
    },
    async getTopCreators(this: IUserModel, page: string) {
      const limit = 12;
      const skip = parseInt(page) * limit;

      return await this.aggregate<UserDocument>([
        { $addFields: { postCount: { $size: '$posts' } } },
        { $sort: { postCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: 12 },
        { $project: { ...getSelectData(selectUserPopulateArr) } }
      ]);
    },
    async searchUsers(this: IUserModel, query: string, page: string) {
      const limit = 12;
      const skip = parseInt(page) * limit;

      return await this.aggregate<UserDocument>([
        { $match: { $text: { $search: `\"${query}\"` } } },
        { $sort: { score: { $meta: 'textScore' }, createdAt: -1 } },
        { $skip: skip },
        { $limit: 12 },
        { $project: { ...getSelectData(selectUserPopulateArr) } }
      ]);
    },
    async getFollowingsByUserID(this: IUserModel, userID: string) {
      const user = await this.findById(userID).lean();
      if (!user) return [];

      return await this.find({ _id: { $in: user.following } }).lean();
    },
    async getFollowersByUserID(this: IUserModel, userID: string) {
      const user = await this.findById(userID).lean();
      if (!user) return [];

      return await this.find({ _id: { $in: user.followers } }).lean();
    }
  }
})
export class User {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, index: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'Post' }],
    default: []
  })
  posts: Post[];

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'User' }],
    default: []
  })
  followers: User[];

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'User' }],
    default: []
  })
  following: User[];

  @Prop({ default: null })
  bio: string;

  @Prop({ required: true, lowercase: true, index: true, unique: true })
  alias: string;

  @Prop({ default: null })
  image: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

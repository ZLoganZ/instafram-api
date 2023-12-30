import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaMongoose } from 'mongoose';

import { Post } from './post.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
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

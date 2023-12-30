import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaMongoose } from 'mongoose';

import { User } from './user.schema';
import { Comment } from './comment.schema';
import { Save } from './save.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  content: string;

  @Prop({
    type: SchemaMongoose.Types.ObjectId,
    required: true,
    index: true,
    ref: 'User'
  })
  creator: User;

  @Prop({
    type: String,
    enum: ['Public', 'Private', 'Followers'],
    default: 'Public'
  })
  visibility: string;

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'User' }],
    default: []
  })
  likes: User[];

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'User' }],
    default: []
  })
  comments: Comment[];

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'User' }],
    default: []
  })
  saves: Save[];

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  location: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

import { User } from '@/user/schema/user.schema';
import { Comment } from '@/comment/schema/comment.schema';
import { Save } from '@/schema/save.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
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

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  image: string;

  @Prop({ default: '' })
  location: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

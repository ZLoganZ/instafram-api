import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

import { User } from '@/user/schema/user.schema';
import { Post } from '@/post/schema/post.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: SchemaMongoose.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  })
  user: User;

  @Prop({
    type: SchemaMongoose.Types.ObjectId,
    ref: 'Post',
    index: true,
    required: true
  })
  post: Post;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'User' }],
    default: []
  })
  likes: User[];

  @Prop({
    type: [{ type: SchemaMongoose.Types.ObjectId, ref: 'Comment' }],
    default: []
  })
  comments: Comment[];

  @Prop({ default: false })
  isChild: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

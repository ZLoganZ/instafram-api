import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaMongoose } from 'mongoose';

import { User } from '@/user/schema/user.schema';
import { Post } from '@/post/schema/post.schema';

export type SaveDocument = Save & Document;

@Schema({ timestamps: true })
export class Save {
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
}

export const SaveSchema = SchemaFactory.createForClass(Save);

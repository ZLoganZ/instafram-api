import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaMongoose } from 'mongoose';

import { User } from './user.schema';
import { Post } from './post.schema';

export type SaveDocument = HydratedDocument<Save>;

@Schema()
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

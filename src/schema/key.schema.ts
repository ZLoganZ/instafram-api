import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as SchemaMongoose } from 'mongoose';

import { User } from './user.schema';

export type KeyDocument = HydratedDocument<Key>;

@Schema()
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

  @Prop({ index: true, default: [] })
  refreshTokensUsed: string[];

  @Prop({ required: true })
  refreshToken: string;
}

export const KeySchema = SchemaFactory.createForClass(Key);

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { PostModule } from '@/post/post.module';
import { CommentModule } from '@/comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
        dbName: 'test'
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule
  ]
})
export class AppModule {}

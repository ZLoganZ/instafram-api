import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/strategy';
import { Key, KeySchema } from '@/auth/schema/key.schema';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]), UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}

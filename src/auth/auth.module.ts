import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GoogleStrategy } from './auth.googleStartegy';


@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async function(configService: ConfigService) {
        return {  secret: configService.get('JWT_SECRET_KEY'),
          signOptions: { expiresIn: '1d' }
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [GoogleStrategy],
  exports: [JwtModule]
})
export class AuthModule {}
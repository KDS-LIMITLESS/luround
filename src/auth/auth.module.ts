import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './auth.googleStartegy.js';
import { LocalStrategy } from './local.strategy.js';
import { JwtAuthGuard, JwtStrategy } from './jwt.strategy.js';
import { AuthService } from './auth.service.js';
import { DatabaseService } from '../store/db.service.js';
import { AuthControllers } from './auth.controllers.js';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async function(configService: ConfigService) {
        return {  secret: configService.get('JWT_SECRET_KEY'),
          signOptions: { expiresIn: '1d' }
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthControllers],
  providers: [{provide: APP_GUARD, useClass: JwtAuthGuard},GoogleStrategy, AuthService, 
    LocalStrategy, JwtStrategy, 
    DatabaseService
  ],
  exports: [JwtModule]
})
export class AuthModule {}
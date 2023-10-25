import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './auth.googleStartegy';
import { LocalStrategy } from './local.strategy';
import { JwtAuthGuard, JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/store/db.service';
import { AuthControllers } from './auth.controllers';
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
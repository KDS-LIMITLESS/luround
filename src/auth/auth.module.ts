import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './auth.googleStartegy';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/store/db.service';
import { AuthControllers } from './auth.controllers';


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
  providers: [GoogleStrategy, AuthService, 
    LocalStrategy, JwtStrategy, 
    DatabaseService
  ],
  exports: [JwtModule]
})
export class AuthModule {}
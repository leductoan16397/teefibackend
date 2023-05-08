import { Global, Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './passport/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { StripeModule } from '../payment/stripe/stripe.module';
import { GraphJWTGuard } from './guard/graph.jwt.guard';
import { RestJWTGuard } from './guard/rest.jwt.guard';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    StripeModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AuthResolver,
    // GraphJWTGuard,
    // RestJWTGuard,
  ],
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}

import { HttpStatus, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { RootModule } from './module/root.module';
import { LoggingPlugin } from './common/apolloLogging.service';

@Module({
  imports: [
    RootModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      csrfPrevention: false,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'schema.graphql'),
      sortSchema: true,
      logger: console,
      formatError: (formattedError) => {
        console.log(
          `🚀 ~ file: app.module.ts:36 ~ GraphQLError: Time: ${new Date()} | Path: ${formattedError.path}`,
          formattedError.extensions,
        );

        return {
          message: formattedError.message,
          code:
            (formattedError.extensions as any)?.status ||
            (formattedError.extensions?.originalError as any)?.statusCode ||
            HttpStatus[(formattedError?.extensions as any)?.code],
        };
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: HeaderResolver, options: ['lang'] }],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, LoggingPlugin],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    mongoose.set('debug', true);
  }
}

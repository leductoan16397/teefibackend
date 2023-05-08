import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import {
  UploadObjectType,
  UploadsObjectType,
} from './objectType/upload.objectType';
import { AuthGql } from '../auth/decorator/auth.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';
import { GraphqlCurrentUser } from '../auth/decorator/loggedUser.decorator';
import { LoggedUser } from '../auth/passport/auth.type';
import { FileUpload } from './interface/fileUpload.interface';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => UploadObjectType)
  @AuthGql()
  async uploadFile(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
  ) {
    return this.uploadService.uploadFile({ file, loggedUser, i18n });
  }

  @Mutation(() => UploadsObjectType)
  @AuthGql()
  async uploadFiles(
    @I18n() i18n: I18nContext,
    @GraphqlCurrentUser() loggedUser: LoggedUser,
    @Args({
      name: 'files',
      type: () => [GraphQLUpload],
      nullable: 'itemsAndList',
    })
    files: FileUpload[],
  ) {
    return this.uploadService.uploadFiles({ files, loggedUser, i18n });
  }
}

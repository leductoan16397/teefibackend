import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthRest } from '../auth/decorator/auth.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { LoggedUser } from '../auth/passport/auth.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { RestCurrentUser } from '../auth/decorator/loggedUser.decorator';
import { Request, Response } from 'express';
import { DynamicError } from 'src/common/error';

@Controller('uploadFile')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @AuthRest()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @I18n() i18n: I18nContext,
    @RestCurrentUser() loggedUser: LoggedUser,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return res.send({
        success: 0,
        msg: 'No file upload',
      });
    }
    const url = await this.uploadService.uploadFileRest({
      loggedUser,
      mimetype: file.mimetype,
      originalname: file.originalname,
      buffer: file.buffer,
    });
    return res.send({ url });
  }

  @Post('files')
  @AuthRest()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @I18n() i18n: I18nContext,
    @RestCurrentUser() loggedUser: LoggedUser,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files) {
      return res.send({
        success: 0,
        msg: 'No file upload',
      });
    }
    try {
      const fileCount = files.length;
      const promises = files.map(async (file: Express.Multer.File) => {
        const url = await this.uploadService.uploadFileRest({
          buffer: file.buffer,
          loggedUser,
          mimetype: file.mimetype,
          originalname: file.originalname,
        });

        return url;
      });

      const promisesResult = await Promise.allSettled(promises);

      const urls =
        promisesResult
          .filter((item) => item.status === 'fulfilled')
          .map((item) => (item as any).value) || [];

      return res.send({
        urls,
        status: `Uploaded successfully ${urls.length} of ${fileCount} files`,
      });
    } catch (error) {
      throw new DynamicError(error);
    }
  }
}

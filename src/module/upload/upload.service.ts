import { Injectable } from '@nestjs/common';
// import { FileUpload } from 'graphql-upload/Upload.mjs';
import { LoggedUser } from '../auth/passport/auth.type';
import { I18nContext } from 'nestjs-i18n';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../database/schema/user.schema';
import { Model } from 'mongoose';
import { readableToBuffer } from 'src/common/utils';
import { FileUploadLog } from '../database/schema/fileUploadLog.schema';
import { S3Service } from '../aws/s3.service';
import { FileUpload } from './interface/fileUpload.interface';
import { DynamicError } from 'src/common/error';

// const {FileUpload} =  import('graphql-upload/Upload.mjs');

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(FileUploadLog.name)
    private readonly fileUploadLogModel: Model<FileUploadLog>,

    @InjectModel(User.name)
    private readonly userModel: Model<User> & typeof User,

    private readonly s3Service: S3Service,
  ) {}

  getFolderByFileType(fileType: string) {
    const rootFolder = 'publics/userUpload';

    if (fileType.includes('image')) return `${rootFolder}/image`;

    if (
      fileType.includes('text') ||
      fileType.includes('epub') ||
      fileType.includes('document')
    ) {
      return `${rootFolder}/text`;
    }

    if (fileType.includes('video')) return `${rootFolder}/video`;

    if (fileType.includes('pdf')) return `${rootFolder}/pdf`;

    return 'publics/upload';
  }

  async uploadFileToS3({ mimetype, filename, buffer, user }) {
    const bucket = process.env.AWS_BUCKET || 'devteefi';

    const folderName = this.getFolderByFileType(mimetype);
    const key = `${folderName}/${new Date().getTime()}_${filename.replace(
      / /g,
      '',
    )}`;

    await this.s3Service.putObject({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: mimetype,
    });

    await new this.fileUploadLogModel({
      key,
      fileType: mimetype,
      bucket,
      userId: user._id,
    }).save();

    return `${process.env.AWS_CLOUD_FRONT_URL}/${key}`;
  }

  async uploadFile({
    file,
    loggedUser,
    i18n,
  }: {
    file: FileUpload;
    loggedUser: LoggedUser;
    i18n: I18nContext;
  }) {
    try {
      const user = await this.userModel.findById(loggedUser.id);

      const { filename, mimetype, createReadStream } = await file;
      const stream = createReadStream();
      const buffer = await readableToBuffer(stream);

      const url = await this.uploadFileToS3({
        buffer,
        filename,
        mimetype,
        user,
      });

      return { url };
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }

  async uploadFiles({
    files,
    loggedUser,
    i18n,
  }: {
    files: FileUpload[];
    loggedUser: LoggedUser;
    i18n: I18nContext;
  }) {
    try {
      const fileCount = files.length;

      const promises = files.map(async (file) => {
        const { url } = await this.uploadFile({ file, loggedUser, i18n });

        return url;
      });

      const promisesResult = await Promise.allSettled(promises);

      const urls =
        promisesResult
          .filter((item) => item.status === 'fulfilled')
          .map((item) => (item as any).value) || [];

      return {
        urls,
        status: `Uploaded successfully ${urls.length} of ${fileCount} files`,
      };
    } catch (ex) {
      console.log(ex.message);
      throw new DynamicError(ex);
    }
  }

  async uploadFileRest({
    loggedUser,
    originalname,
    mimetype,
    buffer,
  }: {
    loggedUser: LoggedUser;
    originalname: string;
    mimetype: string;
    buffer: Buffer;
  }) {
    const user = await this.userModel.findById(loggedUser.id);

    const url = await this.uploadFileToS3({
      filename: originalname,
      mimetype: mimetype,
      user,
      buffer,
    });

    return url;
  }
}

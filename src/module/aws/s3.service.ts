import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { existsSync, readFileSync } from 'fs';

@Injectable()
export class S3Service {
  s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SECRET_KEY'),
      },
      region: configService.get<string>('AWS_REGION'),
    });
  }

  async checkFileExist(fileUrl: string) {
    try {
      const rs = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: fileUrl,
        }),
      );
      return true; // file exists
    } catch (error) {
      return false;
    }
  }

  async uploadLocalFileToS3(imgUrl: string, imgName: string) {
    if (!existsSync(imgUrl)) {
      throw new Error('errorFileNotFound');
    }

    const result = await this.s3Client
      .send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Body: readFileSync(imgUrl),
          Key: imgName,
          ACL: 'public-read',
        }),
      )
      .then((res) => {
        //console.log(`Upload succeeded - `, res);
        return `${process.env.AWS_CLOUD_FRONT_URL}/${imgName}`;
      });
    return result;
  }

  async deleteS3Object({ bucket, key }: { bucket: string; key: string }) {
    if (!bucket || !key) {
      return;
    }

    const result = await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    return result;
  }

  async uploadFileUrlToS3(imgUrl: string, imgName: string) {
    const resImg: any = await fetch(imgUrl);
    const blob = await resImg.buffer();

    const result = await this.s3Client
      .send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Body: blob,
          Key: imgName,
          ACL: 'public-read',
        }),
      )
      .then((res) => {
        return `${process.env.AWS_CLOUD_FRONT_URL}/${imgName}`;
      })
      .catch((err) => {
        return false;
      });
    return result;
  }

  async putObject(input: PutObjectCommandInput) {
    const result = await this.s3Client.send(new PutObjectCommand(input));

    return result;
  }

  async getObjectFromKey(url: string) {
    const result = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: url,
      }),
    );

    return result;
  }
}

import { createHmac, randomBytes } from 'crypto';
import {} from './constant';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';

import { Request } from 'express';
import * as lodash from 'lodash';

export const generateSalt = () => {
  return randomBytes(10).toString('hex');
};

export const encodePassword = async (password: string, salt: string) => {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const configService = appContext.get(ConfigService);

  const hash = createHmac('sha256', configService.get('SECRET_KEY'))
    .update(password + salt)
    .digest('hex');

  await appContext.close();

  return hash;
};

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getDayNameInWeek = (dayNum: number) => {
  if (!dayNum) {
    return;
  }

  const dayInWeek = {
    '1': 'Mon',
    '2': 'Tue',
    '3': 'Wed',
    '4': 'Thurs',
    '5': 'Fri',
    '6': 'Sat',
    '7': 'Sun',
  };

  return dayInWeek[dayNum];
};

export const getTimeFormat = (input: Date | string | number) => {
  const day = moment(input);
  const dayNameInWeek = getDayNameInWeek(day.isoWeekday());
  const date = `${day.format('HH:mm')}, ${capitalizeFirstLetter(dayNameInWeek)} ${day.format('D')} ${day.format(
    'MMM',
  )}, ${day.format('YYYY')} `;
  return date;
};

export const ensureDirPath = (dirPath: string) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, {
      recursive: true,
    });
  }
};

export const convertAmountVNDByCurrency = (amount: number, rate: number, currency: string) => {
  switch (currency) {
    case '$':
      amount *= rate;
      break;
  }
  amount = (amount / 1000) * 1000;
  return amount;
};

export const formatMoneyVN = (num: number) => {
  const str = num.toString().split('.');
  if (str[0].length >= 5) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }
  if (str[1] && str[1].length >= 5) {
    str[1] = str[1].replace(/(\d{3})/g, '$1 ');
  }
  return str.join(',');
};

export const readableToBuffer = async (readerStream: any) => {
  return new Promise((rs, rj) => {
    const chunks = [];

    readerStream.on('data', function (chunk) {
      chunks.push(chunk);
    });

    readerStream.on('end', function () {
      const buffer = Buffer.concat(chunks);
      rs(buffer);
    });

    readerStream.on('error', function (err) {
      console.log(err.stack);
      rj(err);
    });
  });
};

export const uniqueSuffix = () => Date.now() + '-' + Math.round(Math.random() * 1e9);

export const editFileName = (req: Request, file: Express.Multer.File, callback) => {
  callback(null, `${uniqueSuffix()}.${file.originalname}`);
};

export const imageFileFilter = (req: Request, file: Express.Multer.File, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const convertNumberToFloat = (value: string | number) => {
  if (!lodash.isNumber(+value)) {
    return;
  }

  const float = parseFloat((+value).toFixed(2));
  return float;
};

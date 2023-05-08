import { HttpException, HttpExceptionOptions } from '@nestjs/common';

const Exceptions = [
  'BadRequestException',
  'UnauthorizedException',
  'NotFoundException',
  'ForbiddenException',
  'NotAcceptableException',
  'RequestTimeoutException',
  'ConflictException',
  'GoneException',
  'HttpVersionNotSupportedException',
  'PayloadTooLargeException',
  'UnsupportedMediaTypeException',
  'UnprocessableEntityException',
  'InternalServerErrorException',
  'NotImplementedException',
  'ImATeapotException',
  'MethodNotAllowedException',
  'BadGatewayException',
  'ServiceUnavailableException',
  'GatewayTimeoutException',
  'PreconditionFailedException',
];

export class DynamicError extends HttpException {
  constructor({
    status,
    message,
    name,
    response,
    options,
    stack,
  }: {
    stack?: string;
    message?: any;
    name?: any;
    response?: string | Record<string, any>;
    status?: number;
    options?: HttpExceptionOptions;
  }) {
    if (!Exceptions.includes(name)) {
      super(response, 500, options);
    } else {
      super(response, status, options);
    }
    this.message = message;
    this.stack = stack;
  }
}

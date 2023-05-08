import { UserRole, UserStatus } from 'src/common/enum';
import { Request } from 'express';

export interface LoggedUser {
  username: string;
  status: UserStatus;
  role: UserRole;
  id: string;
}

export interface TokenPayload {
  id: string;
  username: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: LoggedUser;
}

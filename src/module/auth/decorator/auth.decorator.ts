import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { UserRole } from 'src/common/enum';
import { RolesGqlGuard, RolesRestGuard } from '../guard/roles.guard';
import { RestPassportGuard } from '../guard/rest.passport.guard';
import { GqlPassportGuard } from '../guard/graphql.passport.guard';
import { RestJWTGuard } from '../guard/rest.jwt.guard';
import { GraphJWTGuard } from '../guard/graph.jwt.guard';

export function AuthGql(...roles: UserRole[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(GraphJWTGuard, RolesGqlGuard),
    // UseGuards(GqlPassportGuard, RolesGqlGuard),
  );
}

export function AuthRest(...roles: UserRole[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(RestJWTGuard, RolesRestGuard),
    // UseGuards(RestPassportGuard, RolesRestGuard),
  );
}

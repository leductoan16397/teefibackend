import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';

const URLRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

const validate = (value) => {
  if (typeof value !== 'string') {
    throw new GraphQLError(`Value is not string: ${value}`);
  }

  if (!URLRegex.test(value)) {
    throw new GraphQLError(`Value is not a valid URL: ${value}`);
  }
  return value;
};

const parseLiteral = (ast) => {
  if (ast.kind !== Kind.STRING) {
    throw new GraphQLError(
      `Query error: Can only parse string as url but got a: ${ast.kind}`,
    );
  }

  return validate(ast.value);
};

export const GraphQLURL = new GraphQLScalarType({
  name: 'URL',
  description: 'URL scalar type',
  serialize: validate,
  parseValue: validate,
  parseLiteral: parseLiteral,
});

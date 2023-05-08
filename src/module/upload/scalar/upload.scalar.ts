// import * as FileType from 'file-type';
// import { GraphQLError, GraphQLScalarType } from 'graphql';
// import { Readable } from 'stream';

// /* this is how you will get the file */
// export interface FileUpload {
//   filename: string;
//   mimetype: string;
//   encoding: string;
//   createReadStream: () => Readable;
// }

// const validate = async (value: Promise<FileUpload>): Promise<FileUpload> => {
//   const upload = await value;
//   const stream = upload.createReadStream();
//   const fileType = await FileType.fileTypeFromStream(stream);

//   if (fileType?.mime !== upload.mimetype)
//     throw new GraphQLError('Mime type does not match file content.');

//   return upload;
// };

// /* A Scalar type for file validation (GraphQL only) */
// export const GraphQLUpload = new GraphQLScalarType({
//   name: 'Upload',
//   description: 'The `Upload` scalar type represents a file upload.',
//   async parseValue(value: Promise<FileUpload>): Promise<FileUpload> {
//     const upload = await value;
//     const stream = upload.createReadStream();
//     const fileType = await FileType.fileTypeFromStream(stream);

//     if (fileType?.mime !== upload.mimetype)
//       throw new GraphQLError('Mime type does not match file content.');

//     return upload;
//   },
// });

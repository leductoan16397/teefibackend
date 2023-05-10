import { ApolloServerPlugin, BaseContext, GraphQLRequestContext, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(requestContext: GraphQLRequestContext<BaseContext>): Promise<GraphQLRequestListener<any>> {
    // console.log(requestContext.logger);
    console.log('Request started! Query:\n' + requestContext.request?.query);

    return {
      async willSendResponse() {
        console.log('Will send response');
      },
    };
  }
}

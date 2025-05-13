import { ChannelConfig } from '@nestjstools/messaging';

export class GooglePubSubChannelConfig extends ChannelConfig {
  public readonly credentials: Credentials;
  public readonly topicName: string;
  public readonly subscriptionName: string;

  constructor({
                name,
                credentials,
                topicName,
                subscriptionName,
                enableConsumer,
                avoidErrorsForNotExistedHandlers,
                middlewares,
                normalizer,
              }: GooglePubSubChannelConfig) {
    super(name, avoidErrorsForNotExistedHandlers, middlewares, enableConsumer, normalizer)
    this.credentials = credentials;
    this.topicName = topicName;
    this.subscriptionName = subscriptionName;
  }
}

interface Credentials {
  projectId: string;
}

import { Channel } from '@nestjstools/messaging';
import { GooglePubSubChannelConfig } from './google-pub-sub.channel-config';
import { PubSub } from '@google-cloud/pubsub';

export class GooglePubSubChannel extends Channel<GooglePubSubChannelConfig> {
  public readonly pubSubManager: PubSub;

  constructor(config: GooglePubSubChannelConfig) {
    super(config);
    this.pubSubManager = new PubSub({ projectId: config.credentials.projectId });
  }
}

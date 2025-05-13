import { GooglePubSubChannel } from '../channel/google-pub-sub.channel';
import { ConsumerMessage, IMessagingConsumer } from '@nestjstools/messaging';
import { ConsumerMessageDispatcher } from '@nestjstools/messaging';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { MessageConsumer } from '@nestjstools/messaging';
import { ConsumerDispatchedMessageError } from '@nestjstools/messaging';

@Injectable()
@MessageConsumer(GooglePubSubChannel)
export class GooglePubSubMessagingConsumer implements IMessagingConsumer<GooglePubSubChannel>, OnApplicationShutdown {
  private channel?: GooglePubSubChannel = undefined;

  async consume(dispatcher: ConsumerMessageDispatcher, channel: GooglePubSubChannel): Promise<void> {
    this.channel = channel;
    const manager = this.channel.pubSubManager;

    await manager.createTopic(this.channel.config.topicName);
    const topic = manager.topic(this.channel.config.topicName);

    const [subscriptions] = await topic.getSubscriptions();
    const subscriptionExists = subscriptions.some(sub => sub.name === `projects/${manager.projectId}/subscriptions/${this.channel.config.subscriptionName}`);

    if (!subscriptionExists) {
      await topic.createSubscription(this.channel.config.subscriptionName);
    }

    manager.subscription(this.channel.config.subscriptionName).on('message', message => {
        dispatcher.dispatch(new ConsumerMessage(JSON.parse(message.data.toString()), message.attributes.routingKey));
        message.ack();
    });

    return Promise.resolve();
  }

  async onError(errored: ConsumerDispatchedMessageError, channel: GooglePubSubChannel): Promise<void> {
    return Promise.resolve();
  }

  async onApplicationShutdown(signal?: string): Promise<any> {
    if (this.channel) {
      await this.channel.pubSubManager.close();
    }
  }
}

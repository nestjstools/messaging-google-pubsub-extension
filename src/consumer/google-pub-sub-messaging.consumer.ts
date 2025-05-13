import { GooglePubSubChannel } from '../channel/google-pub-sub.channel';
import { ConsumerMessage, IMessagingConsumer } from '@nestjstools/messaging';
import { ConsumerMessageDispatcher } from '@nestjstools/messaging';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { MessageConsumer } from '@nestjstools/messaging';
import { ConsumerDispatchedMessageError } from '@nestjstools/messaging';
import { ROUTING_KEY_ATTRIBUTE_NAME } from '../const';

@Injectable()
@MessageConsumer(GooglePubSubChannel)
export class GooglePubSubMessagingConsumer implements IMessagingConsumer<GooglePubSubChannel>, OnApplicationShutdown {
  private channel: GooglePubSubChannel;

  async consume(dispatcher: ConsumerMessageDispatcher, channel: GooglePubSubChannel): Promise<void> {
    this.channel = channel;
    const manager = this.channel.pubSubManager;

    const [topics] = await manager.getTopics();
    const topicExists = topics.some(t => t.name.endsWith(channel.config.topicName));

    if (!topicExists && channel.config.autoCreate) {
      await manager.createTopic(channel.config.topicName);
    }

    const topic = manager.topic(channel.config.topicName);

    const [subscriptions] = await topic.getSubscriptions();
    const subscriptionExists = subscriptions.some(
      sub => sub.name.endsWith(channel.config.subscriptionName)
    );

    if (!subscriptionExists && channel.config.autoCreate) {
      await topic.createSubscription(channel.config.subscriptionName);
    }

    manager.subscription(this.channel.config.subscriptionName).on('message', message => {
      dispatcher.dispatch(new ConsumerMessage(JSON.parse(message.data.toString()), message.attributes[ROUTING_KEY_ATTRIBUTE_NAME]));
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

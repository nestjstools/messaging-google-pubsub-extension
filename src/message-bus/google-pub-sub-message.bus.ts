import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { GooglePubSubChannel } from '../channel/google-pub-sub.channel';
import { Buffer } from 'buffer';
import { ROUTING_KEY_ATTRIBUTE_NAME } from '../const';

@Injectable()
export class GooglePubSubMessageBus implements IMessageBus {
  constructor(
    private readonly channel: GooglePubSubChannel,
  ) {
  }

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const topic = this.channel.pubSubManager.topic(this.channel.config.topicName);
    const serializedMessage = JSON.stringify(message.message);
    await topic.publishMessage({ data: Buffer.from(serializedMessage), attributes: {[ROUTING_KEY_ATTRIBUTE_NAME]: message.messageRoutingKey} });
  }
}

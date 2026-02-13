import { CommandDefinition } from '../command-definition.js';
import { ReplyDefinition } from '../reply-definition.js';

import { CONSUMER_SERVICE_COMMANDS } from './consumer.constants.js';
import { ValidateOrderByConsumerPayload } from './schemas/validate-order-by-consumer-payload.schema.js';
import { ValidateOrderByConsumerReplyPayload } from './schemas/validate-order-by-consumer-reply-payload.schema.js';

export const ValidateOrderByConsumer = new CommandDefinition(
  'ValidateOrderByConsumer',
  CONSUMER_SERVICE_COMMANDS,
  ValidateOrderByConsumerPayload,
  new ReplyDefinition('ValidateOrderByConsumerReply', ValidateOrderByConsumerReplyPayload),
);

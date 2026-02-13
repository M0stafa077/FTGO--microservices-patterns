import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';

import { InvalidMessageHandler } from '../../errors/invalid-message-handler.js';

import { CommandHandlerMetadata } from './annotations/command-handler-metadata.js';
import { EventHandlerMetadata } from './annotations/event-handler-metadata.js';
import { MessageController } from './annotations/message-controller.decorator.js';
import { CommandHandler } from './handlers/command-handler.js';
import { EventHandler } from './handlers/event-handler.js';
import { HandlerMethod } from './handlers/handler-method.js';
import type { MessageHandler } from './handlers/message-handler.js';

@Injectable()
export class MessageHandlers implements OnModuleInit {
  private readonly handlers = new Map<string, MessageHandler>();

  public constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
  ) {}

  public onModuleInit(): void {
    for (const controller of this.discovery.getProviders({ metadataKey: MessageController.KEY })) {
      this.registerMethodsOf(controller);
    }
  }

  public find(channel: string, type: string): MessageHandler | undefined {
    return this.handlers.get(this.keyOf(channel, type));
  }

  public channels(): ReadonlyArray<string> {
    return [...new Set([...this.handlers.values()].map((handler) => handler.channel))];
  }

  private registerMethodsOf(controller: InstanceWrapper): void {
    const instance: unknown = controller.instance;
    const prototype: unknown = Object.getPrototypeOf(instance);
    if (typeof instance !== 'object' || instance === null || typeof prototype !== 'object') {
      throw new InvalidMessageHandler(
        `Message controller ${String(controller.name)} has no instance.`,
      );
    }
    for (const name of this.scanner.getAllMethodNames(prototype)) {
      const method = new HandlerMethod(instance, name);
      const event = this.discovery.getMetadataByDecorator(EventHandlerMetadata, controller, name);
      const command = this.discovery.getMetadataByDecorator(
        CommandHandlerMetadata,
        controller,
        name,
      );
      if (event !== undefined) {
        this.register(new EventHandler(event, method));
      }
      if (command !== undefined) {
        this.register(new CommandHandler(command, method));
      }
    }
  }

  private register(handler: MessageHandler): void {
    const key = this.keyOf(handler.channel, handler.type);
    if (this.handlers.has(key)) {
      throw new InvalidMessageHandler(`Two handlers are declared for ${handler.type}.`);
    }
    this.handlers.set(key, handler);
  }

  private keyOf(channel: string, type: string): string {
    return `${channel}/${type}`;
  }
}

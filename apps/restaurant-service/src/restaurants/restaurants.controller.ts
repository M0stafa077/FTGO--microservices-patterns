import { Address, Currency, Money, Role } from '@ftgo/common';
import { Requires, SchemaValidationPipe } from '@ftgo/common/infrastructure';
import { RestaurantMenu } from '@ftgo/contracts';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import type { Response } from 'express';

import { RestaurantResponse } from './dto/restaurant-response.dto.js';
import { MenuItemId } from './entities/menu-item-id.js';
import { MenuItemName } from './entities/menu-item-name.js';
import { MenuItem } from './entities/menu-item.js';
import { Menu } from './entities/menu.js';
import { RestaurantId } from './entities/restaurant-id.js';
import { RestaurantName } from './entities/restaurant-name.js';
import { RestaurantsService } from './restaurants.service.js';
import { OnboardRestaurantRequest } from './schemas/onboard-restaurant-request.schema.js';
import { RestaurantIdParameter } from './schemas/restaurant-id-parameter.schema.js';

@Controller('restaurants')
export class RestaurantsController {
  public constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Requires(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  public async onboard(
    @Body(new SchemaValidationPipe(OnboardRestaurantRequest)) body: OnboardRestaurantRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RestaurantResponse> {
    const restaurant = await this.restaurantsService.onboard(
      RestaurantName.of(body.name),
      Address.of(body.address),
      this.menuOf(body.menu),
    );
    response.location(`/restaurants/${restaurant.id.toString()}`);
    return new RestaurantResponse(restaurant);
  }

  @Get(':restaurantId')
  public async get(
    @Param('restaurantId', new SchemaValidationPipe(RestaurantIdParameter)) restaurantId: string,
  ): Promise<RestaurantResponse> {
    return new RestaurantResponse(
      await this.restaurantsService.getById(RestaurantId.of(restaurantId)),
    );
  }

  @Put(':restaurantId/menu')
  @Requires(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async reviseMenu(
    @Param('restaurantId', new SchemaValidationPipe(RestaurantIdParameter)) restaurantId: string,
    @Body(new SchemaValidationPipe(RestaurantMenu)) body: RestaurantMenu,
  ): Promise<void> {
    await this.restaurantsService.reviseMenu(RestaurantId.of(restaurantId), this.menuOf(body));
  }

  private menuOf(menu: RestaurantMenu): Menu {
    return Menu.of(
      menu.items.map((item) =>
        MenuItem.of(
          MenuItemId.of(item.id),
          MenuItemName.of(item.name),
          Money.of(item.price.amount, Currency.of(item.price.currency)),
        ),
      ),
    );
  }
}

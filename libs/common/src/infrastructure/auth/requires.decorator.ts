import { Reflector } from '@nestjs/core';

import type { Role } from '../../identity/role.js';

export const Requires = Reflector.createDecorator<Role>();

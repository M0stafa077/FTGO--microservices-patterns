import { Tracing } from '@ftgo/common/tracing';

import { SERVICE_NAME } from './app.constants.js';

export const tracing = Tracing.startService(SERVICE_NAME, process.env);

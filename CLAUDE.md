# FTGO — Engineering Standards

FTGO is a food delivery system built as NestJS microservices, based on the example app from _Microservices Patterns_ (Chris Richardson). The design lives in `docs/system-design/`. Read `docs/system-design/README.md` before you change a service boundary, a message, or a saga.

This is a portfolio project. Every line must be production quality. When a rule here conflicts with speed, the rule wins. When a rule blocks a good solution, stop and ask. Do not quietly break it.

## Working with me

When you finish a task, reply with "Done". Add a line only for a follow-up question, or for an assumption or decision you made, in one or two plain sentences. Never summarize what you did.

Never add a `Co-Authored-By` trailer (or any other attribution line) to a commit message or a pull request.

## 1. The style in one sentence

Write TypeScript that reads like well-written Java: statically typed, object-oriented, explicit, and built from small classes that talk to each other through interfaces. The project structure stays idiomatic NestJS: feature modules with controllers, services, DTOs, guards, and decorators. Java shapes the code, not the folders.

## 2. Type safety

- No `any`. Not in code, not in generics, not in tests.
- No type assertions. No `as` (including `as const`), no `<T>value`, no non-null `!`.
- No `@ts-ignore`, `@ts-expect-error`, or `eslint-disable`.
- Narrow `unknown` (catch variables, parsed JSON, message payloads, env vars) only with a schema (section 9) or a type guard.
- Modules are ESM. Relative imports end in `.js`.
- Every method and function declares its return type. Every class member declares its access modifier.
- Mark a field `readonly` unless it must change. Expose collections as `ReadonlyArray<T>` or `ReadonlyMap<K, V>`.
- Model domain primitives as value-object classes: `OrderId`, `Money`, `Quantity`. Never pass a bare `string` or `number` for them. Never use branded types (they need `as`).
- Use string enums for closed sets: `enum OrderState { ApprovalPending = 'APPROVAL_PENDING' }`.
- Named exports only. No `export default`.
- `tsconfig.base.json` holds the strict compiler flags. Never relax them in a package `tsconfig.json`.

## 3. Object-oriented design

- Behavior lives with its data. A class owns its state and exposes intent-revealing methods: `order.approve()`, never `order.state = OrderState.Approved`. Tell, don't ask.
- No setters. No public mutable fields.
- No top-level functions, except the bootstrap in `main.ts`. A calculation belongs on the type that owns the data: `total.add(deliveryFee)`.
- Constructor injection only, as `private readonly` parameters. No property injection, no service locator.
- Aggregates and value objects have a `private` constructor. Named static methods create them: `Order.place(...)` for a new order, `Order.restore(...)` to rebuild one from storage.
- One item per file: one class, one interface, one enum, one schema, or one constants file. An interface and its DI token share one name, so they count as one item.
- Keep classes under ~200 lines and methods under ~20 lines.
- Early returns over nested blocks. No nested ternaries.

## 4. SOLID

- **Single responsibility.** A service owns one feature's business operations. A controller only translates a request into a service call and the result into a response.
- **Open/closed.** Add behavior by adding a class that implements an existing interface, not by adding a branch to a `switch`.
- **Liskov substitution.** Every implementation honors the full contract of its interface, including which errors it throws. No `throw new Error('not implemented')`.
- **Interface segregation.** Small, role-based interfaces. A class depends only on the methods it calls.
- **Dependency inversion.** Services and entities depend on interfaces their feature owns (`Consumers`, `PasswordHashing`). Implementations (`PostgresConsumers`, `Argon2PasswordHashing`) are bound in the module. A service never calls `new` on an implementation.

## 5. Interfaces, polymorphism, composition

**Depend on interfaces.** Every outbound dependency of a service (storage, messaging, clock, other services) is an interface in its feature module.

**Polymorphism over conditionals.** When behavior varies by kind or state, model each variant as a class that implements one interface. A `switch` on an enum is allowed only for exhaustive mapping at a boundary (enum to HTTP status, enum to DB column). It must end with a `never` check:

```ts
default: {
  const unreachable: never = state;
  throw new UnsupportedValue('OrderState', unreachable);
}
```

**Composition over inheritance.** `extends` is allowed only for:

- error classes (section 10)
- a framework type that has no alternative

No abstract base classes to share code. Share code by injecting a collaborator. Add cross-cutting behavior (retry, metrics, tracing) with a class that implements the same interface and delegates to an inner instance.

**Interfaces with Nest DI.** TypeScript interfaces do not exist at runtime. Each injectable interface therefore has a token with the same name, in the same file:

```ts
// orders/orders.ts
export interface Orders {
  findById(id: OrderId): Promise<Order | undefined>;
  getById(id: OrderId): Promise<Order>;
  save(order: Order): Promise<void>;
}
export const Orders = Symbol('Orders');

// orders/orders.service.ts
constructor(@Inject(Orders) private readonly orders: Orders) {}

// orders/orders.module.ts
{ provide: Orders, useClass: PostgresOrders }
```

`find*` returns `T | undefined`. `get*` returns `T` or throws a not-found error.

## 6. Naming

Names come from the domain language in `docs/system-design/` and read like plain English. A reader must understand what a class is from its name, not which pattern it uses.

- No `I` prefix on interfaces.
- No `Impl`, `Base`, `Abstract`, or `Default` in names.
- No pattern names in class or interface names: `Factory`, `Builder`, `Strategy`, `Adapter`, `Decorator`, `Facade`, `Proxy`, `Visitor`, `Observer`, `Singleton`, `Repository`, `Mapper`, `Manager`, `Helper`, `Util`, `Saga`.
- Nest roles keep their suffix, because the framework defines them: `Module`, `Controller`, `Guard`, `Interceptor`, `Pipe`, `Filter`. Inbound adapters are controllers, for HTTP and Kafka alike.
- No abbreviations: `quantity`, not `qty`.

How to name each kind of thing:

- Collection of aggregates: the plural noun. `Orders`, `Tickets`, `Accounts`.
- Implementation: what makes it different, then the interface name. `PostgresOrders`, `InMemoryOrders`, `SystemClock`, `FixedClock`, `RetryingMessageBroker`.
- Service: the feature plus `Service`, with one method per business operation. `OrdersService.placeOrder()`, `AuthService.signIn()`.
- Saga: the business process as a noun. `OrderCreation`, `OrderCancellation`, `OrderRevision`.
- Messages: the names in the catalogue in `docs/system-design/03-communication.md`. Events are past tense (`OrderCreated`). Commands are imperative (`CreateTicket`).
- Errors: the fact, with no suffix. `OrderNotFound`, `IllegalStateTransition`, `CardDeclined`. Each feature keeps its errors in an `errors/` folder: `orders/errors/order-not-found.ts`.
- Booleans: `isX`, `hasX`, `canX`.
- Files: kebab-case of the class. `postgres-orders.ts`, `money.ts`. Nest roles use a dot: `orders.controller.ts`, `orders.service.ts`, `orders.module.ts`, `authentication.guard.ts`, `public.decorator.ts`, `place-order-request.schema.ts`, `order-response.dto.ts`, `order.entity.ts` (aggregate roots), `order.record.ts` (persistence rows).

## 7. Domain model

- Aggregates enforce their own invariants. State changes only through methods. A method that gets an illegal transition throws a domain error. The `*_PENDING` semantic locks live here.
- Value objects are immutable, compare by value, and validate themselves on creation.
- Money is an integer amount in minor units (cents) plus a currency. Never a floating-point number.
- An aggregate records the domain events it causes. The service reads them and writes them to the outbox in the same transaction as the aggregate.
- Aggregates, value objects, and their errors live in a feature's `entities/` and `errors/` folders. They import nothing from Nest, Kysely, Kafka, or TypeBox. Plain TypeScript and `node:` built-ins only.
- Time comes from an injected `Clock`. No `new Date()` or `Date.now()` in entities or services.

## 8. Structure and boundaries

Each service is a standard NestJS app, organized by feature:

```
src/
  main.ts  app.module.ts  migrate.ts
  config/              typed configuration, read from the environment at startup (schemas/ holds the env schemas)
  database/            the Kysely connection (global module), table types, migrations
  <feature>/           one Nest module per feature (auth/, consumers/, orders/, ...)
    <feature>.module.ts  <feature>.controller.ts  <feature>.service.ts
    <feature>.constants.ts  every constant of the feature (limits, formats, timeouts, names)
    schemas/           TypeBox schemas, one per file: register-request.schema.ts
    dto/               response classes
    entities/          aggregates and value objects
    errors/            the feature's errors
    guards/  decorators/
    <interface>.ts  postgres-<interface>.ts  <entity>.record.ts
  health/
```

- Constants never live in a class (`static readonly`) or at the top of a regular file. Put them in the feature's `*.constants.ts`. Shared ones go in `@ftgo/common` (`common.constants.ts`) or `@ftgo/common/infrastructure` (`infrastructure.constants.ts`).
- TypeBox schemas live only in `schemas/` folders, one schema per `*.schema.ts` file.
- Entities and errors depend only on other entities, errors, and constants.
- A service loads an aggregate, calls one of its methods, and saves it, in one transaction. Business rules belong in the entities, not in the service.
- A service depends on interfaces, never on implementations or infrastructure libraries.
- Controllers, guards, and implementations (`postgres-*`, `argon2-*`, `jwt-*`) are the only code that touches Nest HTTP, Kysely, or other drivers.
- Queries use Kysely. A persistence record (`OrderRecord`) is separate from the aggregate. The record converts itself: `OrderRecord.from(order)` and `record.toOrder()`.
- Every route needs an access token. Mark open routes with `@Public()`.
- One aggregate per transaction.
- A service never imports code from another service. Shared code goes through `libs/*` only.
- `libs/contracts` holds message and DTO schemas. It holds no logic.
- `@ftgo/common` is framework-free: entities and services may import it. `@ftgo/common/infrastructure` holds the Nest, TypeBox, and Postgres integrations: services and entities must not import it.
- `eslint.config.mjs` enforces these boundaries and most rules in this file. A violation is a build failure. Inline `eslint-disable` comments have no effect. To change a rule, change the config in its own reviewed commit.

## 9. Validation

- Validate every input at the boundary, before it reaches a service:
  - HTTP body, path params, query, and headers
  - Kafka messages: envelope and payload
  - environment variables, at startup
  - JSON read from DB columns
  - responses from other services (API Gateway)
- Use one schema library: **TypeBox**. The schema is the single source of truth. Declare the schema and its type under the same name: `export const SignInRequest = Type.Object(...)` and `export type SignInRequest = Static<typeof SignInRequest>`. Never write the same type twice by hand.
- Validate HTTP input with `SchemaValidationPipe` and env vars with `Environment` (both in `@ftgo/common/infrastructure`).
- Schemas are strict:
  - unknown keys are rejected (`additionalProperties: false`)
  - strings have a max length; value objects trim and normalize them
  - numbers have ranges
  - IDs are UUIDs
  - money is an integer in minor units
  - enums are closed
- A failed validation returns all field issues at once, as a 400 response (section 10).
- A service with invalid configuration refuses to start.
- Schemas check shape. Business rules (minimum order amount, restaurant open) stay in the domain.

## 10. Error handling

**Error categories.** `@ftgo/common` defines a root `FtgoError` and a small set of category classes. Every project error extends exactly one category and carries a stable machine-readable `code` (for example, `order.not_found`). Throw a category directly only for simple input validation. Otherwise, create a specific error named after the fact.

- `InvalidInput` → 400
- `Unauthenticated` → 401
- `Forbidden` (valid identity, missing role) → 403
- `ResourceNotFound` → 404
- `Conflict` (duplicate, concurrent modification) → 409
- `RuleViolation` (illegal state transition, semantic lock, business rule) → 422
- `ServiceUnavailable` (DB, Kafka, or a downstream service down or timed out) → 503
- anything else → 500

**HTTP responses.** One global exception filter per service maps each category to an RFC 9457 Problem Details response (`application/problem+json`). It contains `type`, `title`, `status`, `detail`, `instance`, `code`, `correlationId`, and `errors[]` for validation issues. A 500 never leaks a stack trace or internal message to the client.

**Throwing and catching.**

- Throw only project error classes. Never a string, a plain object, or a bare `Error`.
- When you wrap an error from a lower layer, keep the original: `new ServiceUnavailable('database.unavailable', 'order store unreachable', { cause })`.
- Repositories classify driver errors with `PostgresFailure`: constraint violations become domain errors, connection failures become `ServiceUnavailable`.
- Never swallow an error. A `catch` either handles the error completely (recover, compensate), or adds context and rethrows.
- No empty `catch`. No log-and-rethrow. Log an error once, at the boundary that handles it.

**Messaging.**

- Retry transient failures with exponential backoff and a retry limit.
- Do not retry permanent failures (invalid message, rule violation). Send them to a dead-letter topic `<topic>.dlq` with the error details.
- An expected business outcome in a saga (card declined, consumer not verified) is a failure reply, not an exception.
- Every message handler is idempotent.

**Runtime.**

- Every outbound call (HTTP, DB, Kafka) has a timeout.
- Graceful shutdown: stop consuming, finish in-flight work, stop the outbox relay, close the pools.
- No floating promises. Use `async`/`await`, not `.then()` chains.

**Logging.**

- Structured logs with `pino`, through an injected logger. No `console.*`.
- Every log line carries the `correlationId`.
- Never log secrets, card data, or personal data.

## 11. Testing

- Every entity and service has unit tests. Every implementation (`postgres-*`, controllers) has integration tests against real Postgres and Kafka (Testcontainers).
- Test doubles are hand-written in-memory implementations of the interfaces (`InMemoryOrders`, `FixedClock`). Avoid mocking libraries. Never mock a type you do not own.
- Test names state the behavior: `it('rejects approval when the order is cancelled')`.
- Arrange, act, assert. No logic (loops, conditionals) in tests.
- Tests follow every rule in this file, including no `any` and no `as`.

## 12. Comments

- Never write comments. No `//`, no `/* */`, no TSDoc. Class, method, variable, and error names carry the meaning. When code needs a comment to be understood, rename or extract until it does not.
- ESLint (`ftgo/no-comments`) fails the build on any comment in `apps/` and `libs/`.
- When a change affects the design, update `docs/system-design/` in the same commit. The docs are the place for the "why".

## 13. Definition of done

A change is done when:

- typecheck, `pnpm lint`, `pnpm format:check`, and tests pass with zero warnings
- every new input has a schema, and every new failure path has a typed error and a test
- the code follows every rule in this file

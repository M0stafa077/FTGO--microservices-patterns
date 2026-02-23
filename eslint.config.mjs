// ESLint enforces the rules in CLAUDE.md. Each block below names the section it enforces.
// Inline `eslint-disable` comments are switched off: change a rule here, in review, or not at all.

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const TS_FILES = ['**/*.ts'];
const TEST_FILES = ['**/test/**/*.ts', '**/*.spec.ts'];

// CLAUDE.md §6: no pattern names, no `I` prefix, no Impl/Base/Abstract/Default.
const FORBIDDEN_TYPE_NAME =
  '^(I[A-Z]|Abstract[A-Z]|Base[A-Z]|Default[A-Z])' +
  '|(Impl|Factory|Builder|Strategy|Adapter|Decorator|Facade|Proxy|Visitor|Observer|Singleton|Repository|Mapper|Manager|Helper|Utils?|Saga)$';

// CLAUDE.md §5, §10: `extends` only for error classes.
// FtgoError extends Error, each category extends FtgoError, and each specific error extends one category.
const EXTENDABLE_CLASSES =
  '^(Error|FtgoError|InvalidInput|Unauthenticated|Forbidden|ResourceNotFound|Conflict|RuleViolation|ServiceUnavailable)$';

const BOOLEAN_PREFIXES = ['is', 'has', 'can'];

// CLAUDE.md §3, §5, §10: syntax that every TypeScript file must avoid.
const SCHEMA_OUTSIDE_SCHEMAS_FOLDER =
  'TypeBox schemas live in a schemas/ folder, one schema per file (CLAUDE.md §8).';
const CONSTANT_OUTSIDE_CONSTANTS_FILE = 'Constants live in a *.constants.ts file (CLAUDE.md §8).';

const FORBIDDEN_SYNTAX = [
  {
    selector: "CallExpression[callee.object.name='Type']",
    message: SCHEMA_OUTSIDE_SCHEMAS_FOLDER,
  },
  {
    selector:
      'PropertyDefinition[static=true][value.type=/^(Literal|TemplateLiteral|ObjectExpression|ArrayExpression|UnaryExpression)$/]',
    message: CONSTANT_OUTSIDE_CONSTANTS_FILE,
  },
  {
    selector:
      ':matches(Program, Program > ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator[init.type=/^(Literal|TemplateLiteral|ObjectExpression|ArrayExpression|UnaryExpression)$/]',
    message: CONSTANT_OUTSIDE_CONSTANTS_FILE,
  },
  {
    selector: ':matches(Program, Program > ExportNamedDeclaration) > FunctionDeclaration',
    message:
      'No top-level functions. Put the behavior on the class that owns the data (CLAUDE.md §3).',
  },
  {
    selector:
      ':matches(Program, Program > ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator > :matches(ArrowFunctionExpression, FunctionExpression)',
    message:
      'No top-level functions. Put the behavior on the class that owns the data (CLAUDE.md §3).',
  },
  {
    selector: `:matches(ClassDeclaration, ClassExpression)[superClass]:not([superClass.name=/${EXTENDABLE_CLASSES}/])`,
    message: 'Composition over inheritance. Only error classes may use `extends` (CLAUDE.md §5).',
  },
  {
    selector: 'ClassDeclaration[abstract=true]',
    message:
      'No abstract base classes. Define an interface and inject a collaborator (CLAUDE.md §5).',
  },
  {
    selector: "MethodDefinition[kind='set']",
    message: 'No setters. Expose an intent-revealing method instead (CLAUDE.md §3).',
  },
  {
    selector:
      ":matches(PropertyDefinition, TSParameterProperty)[accessibility='public']:not([readonly=true])",
    message: 'No public mutable fields (CLAUDE.md §3).',
  },
  {
    selector: "ThrowStatement > NewExpression[callee.name='Error']",
    message: 'Throw a project error class, never a bare Error (CLAUDE.md §10).',
  },
  {
    selector: "CallExpression[callee.property.name='then']",
    message: 'Use async/await, not .then() chains (CLAUDE.md §10).',
  },
  {
    selector: 'TSEnumDeclaration[const=true]',
    message: 'Use a regular string enum, not a const enum.',
  },
];

// CLAUDE.md §7: time and randomness come from injected collaborators.
const FORBIDDEN_IN_CORE = [
  {
    selector: "NewExpression[callee.name='Date']",
    message: 'Get the time from the injected Clock (CLAUDE.md §7).',
  },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: 'Get the time from the injected Clock (CLAUDE.md §7).',
  },
  {
    selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
    message: 'Inject the source of randomness (CLAUDE.md §7).',
  },
];

// CLAUDE.md §8: layer and package boundaries.
const OTHER_APPS = {
  group: ['@ftgo/*-service', '@ftgo/*-service/*', '@ftgo/api-gateway', '@ftgo/api-gateway/*'],
  message:
    'A service never imports code from another service. Share code through libs/* (CLAUDE.md §8).',
};
const INFRASTRUCTURE_TECH = [
  'typebox',
  'typebox/*',
  'jose',
  '@node-rs/*',
  'kafkajs',
  '@confluentinc/*',
  'pg',
  'kysely',
  'kysely/*',
  'typeorm',
  '@mikro-orm/*',
  '@prisma/*',
  'drizzle-orm',
  'drizzle-orm/*',
  'pino',
  'nestjs-pino',
];

// CLAUDE.md §12: no comments in apps/ or libs/. Names carry the meaning.
const ftgo = {
  rules: {
    'no-comments': {
      meta: {
        type: 'suggestion',
        schema: [],
        messages: {
          comment:
            'No comments. Let class, method, and variable names carry the meaning (CLAUDE.md §12).',
        },
      },
      create: (context) => ({
        Program: () => {
          for (const comment of context.sourceCode.getAllComments()) {
            context.report({ loc: comment.loc, messageId: 'comment' });
          }
        },
      }),
    },
  },
};

const restrictedImports = (...patterns) => ['error', { patterns: [OTHER_APPS, ...patterns] }];

const LAYER_RULES = [
  {
    // Entities, value objects, and their errors: the business model of a feature module.
    files: ['apps/*/src/*/entities/**/*.ts', 'apps/*/src/*/errors/**/*.ts'],
    imports: restrictedImports(
      {
        group: ['@nestjs/*', ...INFRASTRUCTURE_TECH],
        message:
          'Entities and errors are plain TypeScript. No framework, database, or schema library (CLAUDE.md §7).',
      },
      {
        group: ['@ftgo/*', '!@ftgo/common', '@ftgo/common/*'],
        message: 'Entities and errors may only use @ftgo/common (CLAUDE.md §7).',
      },
      {
        regex:
          '(^|/)(dto|guards|decorators|database|config|passwords|tokens|sessions)(/|$)|\\.(service|controller|module|guard|decorator|dto|record)\\.js$|(^|/)postgres-',
        message: 'Entities and errors depend only on other entities and errors (CLAUDE.md §8).',
      },
    ),
    core: true,
  },
  {
    // Services hold the business operations. They depend on interfaces, never on implementations.
    files: ['apps/*/src/**/*.service.ts'],
    imports: restrictedImports(
      {
        group: ['@nestjs/*', '!@nestjs/common', ...INFRASTRUCTURE_TECH],
        message:
          'A service depends on interfaces, not on infrastructure libraries. Only @nestjs/common is allowed (CLAUDE.md §8).',
      },
      {
        regex: '(^|/)(postgres|argon2|jwt)-[^/]*$|(^|/)database(/|$)',
        message:
          'A service depends on an interface (`Consumers`), never on its implementation (`PostgresConsumers`) (CLAUDE.md §5).',
      },
      {
        group: ['@ftgo/*/infrastructure', '@ftgo/*/infrastructure/*'],
        message:
          'A service depends on interfaces, never on the infrastructure part of a library (CLAUDE.md §8).',
      },
    ),
    core: true,
  },
  {
    files: ['libs/common/**/*.ts', 'libs/contracts/**/*.ts'],
    imports: restrictedImports({
      group: ['@ftgo/*'],
      message: 'libs/common and libs/contracts depend on no other @ftgo package (CLAUDE.md §8).',
    }),
  },
  {
    files: ['libs/messaging/**/*.ts'],
    imports: restrictedImports({
      group: ['@ftgo/*', '!@ftgo/common', '!@ftgo/contracts'],
      message: 'libs/messaging may only use @ftgo/common and @ftgo/contracts (CLAUDE.md §8).',
    }),
  },
  {
    // The framework-free part of libs/messaging. Services import it, so it stays free of drivers.
    files: ['libs/messaging/src/**/*.ts'],
    ignores: ['libs/messaging/src/infrastructure/**'],
    imports: restrictedImports(
      {
        group: ['@ftgo/*', '!@ftgo/common', '!@ftgo/contracts', '@ftgo/common/*'],
        message:
          'The framework-free part of libs/messaging may only use @ftgo/common and @ftgo/contracts (CLAUDE.md §8).',
      },
      {
        group: ['@nestjs/*', ...INFRASTRUCTURE_TECH.filter((name) => !name.startsWith('typebox'))],
        message:
          'The framework-free part of libs/messaging uses no framework, driver, or logger. Put them in src/infrastructure (CLAUDE.md §8).',
      },
      {
        group: ['typebox', 'typebox/*'],
        allowTypeImports: true,
        message:
          'The framework-free part of libs/messaging uses TypeBox types only. Validate in src/infrastructure (CLAUDE.md §8).',
      },
    ),
  },
  {
    files: ['libs/saga/**/*.ts'],
    imports: restrictedImports({
      group: ['@ftgo/*', '!@ftgo/common', '!@ftgo/contracts', '!@ftgo/messaging'],
      message:
        'libs/saga may only use @ftgo/common, @ftgo/contracts, and @ftgo/messaging (CLAUDE.md §8).',
    }),
  },
  {
    // The framework-free part of libs/saga. Services import it, so it stays free of drivers.
    files: ['libs/saga/src/**/*.ts'],
    ignores: ['libs/saga/src/infrastructure/**'],
    imports: restrictedImports(
      {
        group: [
          '@ftgo/*',
          '!@ftgo/common',
          '!@ftgo/contracts',
          '!@ftgo/messaging',
          '@ftgo/common/*',
          '@ftgo/messaging/*',
        ],
        message:
          'The framework-free part of libs/saga may only use @ftgo/common, @ftgo/contracts, and @ftgo/messaging (CLAUDE.md §8).',
      },
      {
        group: ['@nestjs/*', ...INFRASTRUCTURE_TECH.filter((name) => !name.startsWith('typebox'))],
        message:
          'The framework-free part of libs/saga uses no framework, driver, or logger. Put them in src/infrastructure (CLAUDE.md §8).',
      },
      {
        group: ['typebox', 'typebox/*'],
        allowTypeImports: true,
        message:
          'The framework-free part of libs/saga uses TypeBox types only. Validate in src/infrastructure (CLAUDE.md §8).',
      },
    ),
  },
];

export default defineConfig([
  globalIgnores(['**/dist/', '**/coverage/', '**/node_modules/']),

  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  {
    files: TS_FILES,
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: ['apps/*/tsconfig.json', 'libs/*/tsconfig.json'],
          noWarnOnMultipleProjects: true,
        }),
      ],
    },
    rules: {
      // §2 Type safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowString: false, allowNumber: false, allowNullableObject: false },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true },
      ],
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'method'],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/array-type': ['error', { default: 'array', readonly: 'generic' }],
      // Nest modules are decorated classes that may have no members.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      'import-x/no-default-export': 'error',

      // §3 Object-oriented design
      'no-restricted-syntax': ['error', ...FORBIDDEN_SYNTAX],
      '@typescript-eslint/parameter-properties': [
        'error',
        { allow: ['private readonly', 'public readonly'], prefer: 'parameter-property' },
      ],
      '@typescript-eslint/member-ordering': 'error',
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 25, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/max-params': ['error', { max: 5 }],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'no-nested-ternary': 'error',
      'no-param-reassign': 'error',
      'max-classes-per-file': ['error', 1],
      // An async method without await is fine: it often implements a Promise-returning interface.
      '@typescript-eslint/require-await': 'off',

      // §6 Naming
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        // PascalCase: a DI token or a TypeBox schema shares its name with the type it stands for (§5, §9).
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'variable', modifiers: ['destructured'], format: null },
        {
          selector: ['variable', 'parameter', 'classProperty'],
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: BOOLEAN_PREFIXES,
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
          custom: { regex: FORBIDDEN_TYPE_NAME, match: false },
        },
        { selector: 'enumMember', format: ['PascalCase'] },
        {
          selector: 'classProperty',
          modifiers: ['static', 'readonly'],
          format: ['UPPER_CASE', 'camelCase'],
        },
        // Environment variable names in config schemas.
        // UPPER_CASE: environment variables. snake_case: options of external APIs (pg, SQL).
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          format: ['camelCase', 'UPPER_CASE', 'snake_case'],
        },
        {
          selector: 'parameter',
          modifiers: ['unused'],
          format: ['camelCase'],
          leadingUnderscore: 'require',
        },
        { selector: 'import', format: null },
        {
          selector: ['objectLiteralProperty', 'typeProperty'],
          modifiers: ['requiresQuotes'],
          format: null,
        },
      ],

      // §8 Boundaries (layer rules below)
      'import-x/no-cycle': 'error',
      'import-x/no-relative-packages': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // §10 Error handling
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-console': 'error',

      // General hygiene
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },

  {
    files: ['apps/**/*.ts', 'libs/**/*.ts'],
    plugins: { ftgo },
    rules: { 'ftgo/no-comments': 'error' },
  },

  ...LAYER_RULES.map(({ files, ignores = [], imports, core }) => ({
    files,
    ignores,
    rules: {
      'no-restricted-imports': imports,
      ...(core
        ? { 'no-restricted-syntax': ['error', ...FORBIDDEN_SYNTAX, ...FORBIDDEN_IN_CORE] }
        : {}),
    },
  })),

  {
    files: [
      'apps/*/src/main.ts',
      'apps/*/src/migrate.ts',
      'apps/*/src/grant-admin.ts',
      'apps/*/src/rebuild.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...FORBIDDEN_SYNTAX.filter(({ message }) => !message.startsWith('No top-level functions')),
      ],
    },
  },

  {
    files: ['**/schemas/*.schema.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...FORBIDDEN_SYNTAX.filter(({ message }) => message !== SCHEMA_OUTSIDE_SCHEMAS_FOLDER),
      ],
    },
  },

  {
    files: ['**/*.constants.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...FORBIDDEN_SYNTAX.filter(({ message }) => message !== CONSTANT_OUTSIDE_CONSTANTS_FILE),
      ],
    },
  },

  {
    files: TEST_FILES,
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  prettier,
]);

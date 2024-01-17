## Starting the Database

```
docker-compose up postgres postgres_e2e_test
```

- db/default：Regular
- db/default：For End-to-End (e2e) Testing

## Migration

- Generating Migration Files

```
npm run drizzle:generate
npm run drizzle:generate:e2e
```

- Running Migrations

```
npm run drizzle:push
npm run drizzle:push:e2e
```

- Starting Drizzle Studio

```
npm run drizzle:studio
npm run drizzle:studio:e2e
```

## Starting the Application (Development)

```
npm run start:dev
```

## Starting the Application (Production)

```
npm run build
npm run start
```

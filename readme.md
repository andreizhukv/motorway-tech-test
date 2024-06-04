# Tech Challenge

## Description

Tech challenge can be found [here](https://motorway.notion.site/Senior-Backend-Engineer-Tech-Challenge-6e59f0edc5d942b0a591a2b1aa248b3f)

## Introduction

I haven't used before nestjs and typeorm. So it was a good learning experience.
Why did I choose nestjs? I wanted to try this popular node.js framework.
Why did I choose typeorm as ORM? I love typescript and it is one of the popular choices with typescript support.

## Installation

```bash
$ npm install
```

## Running the app

Start database:

```bash
$ docker-compose up
```

And after start service:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

The fastest option to do manual testing is by importing postman collection from test folder.

## Some explanations and reasoning

- I decided to discard provided database and start fresh with typeorm. Leveraging typeorm synchronise option in local development was faster and easier for me. Synchronise has to be disabled in non local envs and we have to rely on migrations.
- The next question in my mind was about RESTFUL vs GRAPHQL style. I chose RESTFUL approach but it could have been achieved with either of options.
- I added one to many relationship between Vehicle and StateLog(Foreign key is added and thus it is faster join).
- When Vehicle is created then StateLog is created as well. I decided to wrap it in transaction so StateLog entity will be always relevant. I did the same for update. Without transaction it is possible that vehicle will be created and after that node will be killed right before state log creation.
- I don't think that it is useful to add caching for queries by vehicleId and timestamp. The only case when it will be useful is when there will be a lot of requests with the same vehicleId and the same timestamp. But I assume that it is not the case thus caching is not good here.
- Where will be caching useful? Highly likely in real world you ask your Search Database to find all the _red bmws_ and Search Database will return a list of vehicleIds. Thus it is a frequent pattern of fetching from vehicle service a list of vehicles by ids. And for this caching will be very useful.
- e2e tests use separate postgres container which is destroyed after run(destroyed with its volume). The choice was made due to its simplicity and isolation.
- I haven't covered everything by tests as I only wanted to cover main parts. e2e tests are the more important because they do exactly what consumer of this service does.
- Added postman collection as a quick docs (didn't add tests for it). File - test/API Docs.postman_collection.json. It is just a quick way to create a bunch of entities or play with api manually without digging into e2e.
- Committing .env.local is usually bad but I did it to save reviewer's time
- The node version in .nvmrc is just my default (18 something). In real life scenario I would think of choosing a newer one.

## Missing (nice to add)

- Logging and monitoring. Especially logging with custom ExceptionFilter
- Proper pagination support for GET /vehicle endpoint. Highly likely good option will be cursor-based pagination due to the high number of updates.
- Migrations
- OpenAPI(swagger)
- Mock factory based on faker library to easily create test entities
- Seeding data to database on startup. Leveraging mock factory from previous point will be really useful
- Limit column length for make + model
- Containerised local env

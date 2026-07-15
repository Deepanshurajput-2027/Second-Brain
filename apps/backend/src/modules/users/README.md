# Users Module

The **Users** module is responsible for encapsulating the domain model and database operations related to user accounts in the application.

## Responsibilities

- **Domain Entity**: Defines the Mongoose Schema (`user.schema.js`), validation rules, and indexes.
- **Database Operations**: Exposes a Data Access Layer via `UserRepository` (`user.repository.js`) abstracting Mongoose implementation details from the rest of the application.
- **Constants**: Maintains shared user domain constraints and configurations (`user.constants.js`).

## What it DOES NOT DO

- **No Controllers or Routes**: API endpoints handling HTTP requests are purposefully excluded from this layer.
- **No Authentication Logic**: Generating JWTs, verifying credentials, and managing sessions is delegated to the `Auth` module to maintain single responsibility.

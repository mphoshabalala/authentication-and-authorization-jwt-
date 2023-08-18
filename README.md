# Express Authentication and Authorization API

This is a simple Express.js application that demonstrates user authentication and authorization using JWT (JSON Web Tokens) and bcrypt for password hashing. The application uses a MySQL database to store user information.

## Table of Contents

- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Sign Up](#sign-up)
  - [Login](#login)
  - [Protected Route](#protected-route)

## Dependencies

This application requires the following dependencies:

- Express.js: A web application framework for Node.js.
- MySQL2: A MySQL library for Node.js that supports Promises.
- Bcrypt: A library for hashing passwords securely.
- JWT (jsonwebtoken): A library for creating and verifying JSON Web Tokens.
- Cors: A middleware to enable Cross-Origin Resource Sharing.

## Getting Started

1. Clone this repository to your local machine.
2. Install the required dependencies using the following command:

   ```bash
   npm install
   ```

3. Configure your MySQL database settings in the `connection` object within the code (`const connection = mysql.createConnection({...});`).
4. Start the Express server using the following command:

   ```bash
   node app.js
   ```

The server will be accessible at `http://localhost:5000`.

## API Endpoints

### Sign Up

**Endpoint:** `POST /sign-up`

This endpoint allows users to register by providing their name, email, password, and confirmPassword in the request body.

- If the passwords do not match, a 500 status response will be returned with a "Password doesn't match" message.
- Upon successful registration, the password will be securely hashed using bcrypt, and the user's information will be stored in the MySQL database.

### Login

**Endpoint:** `POST /login`

This endpoint allows users to log in using their email and password.

- If the email is not found in the database, a 500 status response will be returned with an "Invalid email" message.
- If the provided password does not match the hashed password stored in the database, a 500 status response will be returned with an "Invalid password" message.
- Upon successful login, a JWT token will be generated using the user's information and a secret key, and this token will be sent in the response.

### Protected Route

**Endpoint:** `GET /`

This is a protected route that requires a valid JWT token in the request header for authentication.

- The route uses the `verifyToken` middleware to check the validity of the JWT token.
- If the token is valid, the user's ID will be extracted from the token's payload, and the response will contain a message along with the user's ID.

### Middleware: `verifyToken`

This middleware function is used to verify the authenticity of a JWT token provided in the request header.

- It checks for the presence of the `Authorization` header.
- If the token is valid, the user's ID is extracted from the payload and attached to the request object.
- If the token is invalid or missing, a 401 status response (Unauthorized) is returned.

**Note:** Replace `"secret_key_here"` with your actual secret key for JWT token generation and verification.

## Important Notes

- This application need further refinement for production use, including handling errors more robustly and using environment variables for sensitive configuration.

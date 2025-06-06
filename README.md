# Agent Performance Reporting Engine (APRE)

APRE is a MEAN stack application for managing and reporting on agent performance, sales, and customer feedback.

---

## Table of Contents

- [Client-side (apre-client)](#client-side-apre-client)
- [Server-side (apre-server)](#server-side-apre-server)
- [Project Structure](#project-structure)
- [License](#license)

---

## Client-side (`apre-client`)

The client-side is built with [Angular](https://angular.io/).

### Features

- Dashboard with summary reports
- Sales, agent performance, and customer feedback reports
- User authentication and management
- Responsive UI with modern styling

### Getting Started

1. **Install dependencies:**
   ```sh
   cd apre-client
   npm install
   ```

2. **Run the development server:**
   ```sh
   npm start
   ```
   The app will be available at [http://localhost:4200](http://localhost:4200).

3. **Build for production:**
   ```sh
   npm run build
   ```

4. **Run unit tests:**
   ```sh
   npm test
   ```

### Project Structure

- `src/app/` - Angular application source code
- `src/environments/` - Environment configuration
- `public/` - Static assets

---

## Server-side (`apre-server`)

The server-side is built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/), using MongoDB as the database.

### Features

- RESTful API for users, authentication, dashboard, and reports
- Secure password hashing with bcrypt
- Error handling and CORS support

### Getting Started

1. **Install dependencies:**
   ```sh
   cd apre-server
   npm install
   ```

2. **Configure MongoDB:**
   - Update the connection string in [`src/utils/config.js`](apre-server/src/utils/config.js) if needed.

3. **Run the server:**
   ```sh
   npm start
   ```
   The API will be available at [http://localhost:3000/api](http://localhost:3000/api).

4. **Run tests:**
   ```sh
   npm test
   ```

### Project Structure

- `src/routes/` - Express route handlers (users, security, dashboard, reports)
- `src/utils/` - Utility modules (MongoDB connection, error handling)
- `test/` - Jest test suites

---

## Project Structure

```
apre-client/   # Angular client application
apre-server/   # Node.js/Express server application
```

---

## License

This project is for educational purposes.

# CinemaSystemNodeBackend

This is a simple Node.js application that provides an API for managing cinema-related data, such as cinemas, movies, schedules, and tickets.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v12 or later)
* MySQL server

### Installing

1. Clone the repository to your local machine.
2. Navigate to the project directory and install the required dependencies by running the following command:

    ```bash
    npm install
    ```

3. Create a new MySQL database for the project and import the sample data from cinemaDatabaseScheme.sql file provided in the project directory.
4. Modify the db.config.json file in the config directory to match your MySQL configuration settings.

### Running the Application

1. Start the Node.js server by running the following command:

    ```bash
    npm install
    ```

2. The server should now be running on <http://localhost:8080>. You can use a tool like Postman or a web browser to test the various API endpoints.

### API Endpoints

The following API endpoints are available:

#### Cinemas

* `POST /cinema/theater` - create a new cinema
* `GET /cinema/theater` - retrieve all cinemas
* `GET /cinema/theater/findById` - retrieve a specific cinema by ID
* `PUT /cinema/theater` - update an existing cinema
* `DELETE /cinema/theater` - delete an existing cinema

#### Movies

* `POST /cinema/movie` - create a new movie
* `GET /cinema/movie` - retrieve all movies
* `GET /cinema/movie/findById` - retrieve a specific movie by ID
* `POST /cinema/movie/insertNewRating` - insert a new rating for a movie
* `PUT /cinema/movie` - update an existing movie
* `DELETE /cinema/movie` - delete an existing movie

#### Schedules

* `POST /cinema/schedule` - create a new schedule
* `GET /cinema/schedule` - retrieve all schedules
* `DELETE /cinema/schedule` - delete an existing schedule

#### Tickets

* `POST /cinema/ticket` - create a new ticket
* `GET /cinema/ticket` - retrieve all tickets
* `DELETE /cinema/ticket` - delete an existing ticket

#### Users

* `POST /cinema/login` - create a new user
* `GET /cinema/login/isUsed` - check if a username is already in use

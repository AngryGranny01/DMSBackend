# DMSBackend

This is a simple Node.js application that provides an API for managing documents, projects, users, and logs.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v12 or later)
* MySQL server

### Installing

1. Clone the repository to your local machine.

    ```bash
    git clone https://github.com/AngryGranny01/DMSBackend.git
    cd DMSBackend
    ```

2. Navigate to the project directory and install the required dependencies by running the following command:

    ```bash
    npm install
    ```

3. Create a new MySQL database for the project and import the sample data from `databaseSetup.sql` file provided in the project directory.
4. Modify the `.env` file to match your MySQL configuration settings.

### Running the Application

1. Start the Node.js server by running the following command:

    ```bash
    npm start
    ```

2. The server should now be running on <https://localhost:8080/DMSSystemAPI>. You can use a tool like Postman or a web browser to test the various API endpoints.

### API Documentation

The API is documented using Swagger. Once the server is running, you can access the Swagger UI at:
<https://localhost:8080/DMSSystemAPI/api-docs>
The Swagger UI provides detailed information about the available endpoints, including request parameters, responses, and example requests.

### API Endpoints

The following API endpoints are available:

#### Users

* `POST /users` - Create a new user.
* `GET /users` - Retrieve all users (Admin or Project Manager access required).
* `GET /user/:userID` - Retrieve a specific user by ID (Admin access required).
* `PUT /users` - Update an existing user (Admin or Project Manager access required).
* `PUT /users/password` - Update a user's password.
* `PUT /users/deactivate/:accountID` - Deactivate a user account (Admin access required).
* `DELETE /users/:id` - Delete an existing user (Admin access required).
* `GET /users/checkEmailExist` - Check if an email already exists.
* `GET /users/findSalt` - Retrieve the salt value for a given email.
* `PUT /verifyToken` - Verify a token and update a password.

#### Projects

* `POST /projects` - Create a new project (Admin or Project Manager access required).
* `GET /projects` - Retrieve all projects (Admin access required).
* `GET /projects/:userID` - Retrieve all projects associated with a specific user.
* `PUT /projects` - Update an existing project (Admin or Project Manager access required).
* `DELETE /projects` - Delete an existing project by projectID (Admin or Project Manager access required).

#### Logs

* `POST /logs` - Create a new log entry (Admin or Project Manager access required).
* `GET /logs/project/:projectID` - Retrieve logs for a specific project.
* `GET /logs/user/:userID` - Retrieve logs for a specific user.
* `GET /logs/lastLogins` - Retrieve the last login dates for all users.

### Logging

The application includes detailed logging for various activities such as user creation, updates, deletions, project management, and error handling. Error logs are recorded to help diagnose and resolve issues effectively.

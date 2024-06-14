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

3. Create a new MySQL database for the project and import the sample data from `db.sql` file provided in the project directory.
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

* `POST /users` - Create a new user
* `GET /users` - Retrieve all users
* `GET /users/:id` - Retrieve a specific user by ID
* `PUT /users` - Update an existing user
* `DELETE /users/:id` - Delete an existing user
* `GET /users/checkEmailExist` - Check if email exists
* `GET /users/checkUsernameExist` - Check if username exists
* `GET /users/findSalt` - Find the salt for a given email
* `PUT /verifyToken` - Verify a token

#### Projects

* `POST /projects` - Create a new project
* `GET /projects` - Retrieve all projects
* `GET /projects/:userID` - Retrieve projects for a user
* `PUT /projects` - Update an existing project
* `DELETE /projects?projectID=:id` - Delete an existing project

#### Logs

* `POST /user-logs` - Create a user log
* `GET /user-logs/:userID` - Retrieve logs for a specific user
* `GET /user-logs/lastLogins/:userID` - Retrieve last login dates for a user
* `POST /project-logs` - Create a project log
* `GET /project-logs/:projectID` - Retrieve logs for a specific project

### Logging

The application includes detailed logging for various activities such as user creation, updates, deletions, project management, and error handling. Error logs are recorded to help diagnose and resolve issues effectively.

### Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License.

# Bank Management Web Project

## Introduction

The **Bank Management Web Project** is a comprehensive online platform designed to modernize traditional banking operations. It enhances operational efficiency, customer convenience, and service quality through a secure, user-friendly web application.

Customers can perform a wide range of banking activities online—such as account management, transactions, loan applications, and customer support—without needing to visit physical branches.

## Features

- **Account Management**  
  Open, view, and manage bank accounts online. Perform balance inquiries, download statements, and update personal information.

- **Transaction Processing**  
  Secure processing of deposits, withdrawals, fund transfers, and bill payments.

- **Loan Services**  
  Apply for and manage personal, auto, and home loans with an intuitive online process.

- **Security**  
  Advanced security measures including encryption, multi-factor authentication, and regular security audits.

- **User-Friendly Interface**  
  Simple and accessible UI, ensuring ease of use for all customers.

## Technologies Used

### Backend

- Java
- Spring Boot
- Hibernate (ORM)
- JPA (Java Persistence API)
- MySQL
- Apache Tomcat Server

### Frontend

- ReactJS
- HTML
- CSS
- Bootstrap

### Tools

- Eclipse (IDE)
- MySQL Workbench
- Git (Version Control)

## System Architecture

The project follows the **Model-View-Controller (MVC)** architecture:

- **Model**: Represents data and business logic.
- **View**: Frontend interface rendered with ReactJS and HTML/CSS.
- **Controller**: Handles user input, processes requests, and communicates between Model and View.

## Development Process

- Requirements gathering and analysis
- Database design (ERD modeling and normalization)
- MVC-based system design and component development
- Unit testing (White Box and Black Box testing)
- System testing across multiple environments
- Performance testing and optimization
- Security hardening and multi-user system validation

## Database Design

- MySQL relational database
- Entity-Relationship (ER) modeling
- Optimized with primary keys, foreign keys, indexes, and constraints
- Database locking mechanisms for multi-user scenarios

## Testing Strategy

- **Unit Testing**: Individual modules tested independently.
- **System Testing**: Full-system testing across different OS environments.
- **Performance Testing**: Validate system responsiveness and throughput.
- **Multi-user Testing**: Ensure proper database locking and concurrency handling.

## Requirements

### Software

- Java (JSP, Servlet)
- Apache Tomcat Server
- MySQL

## How to Run

### Prerequisites

- Install **Java JDK 17** or higher.
- Install **MySQL Server** and **MySQL Workbench**.
- Install **Node.js** and **npm** for running the React frontend.
- Install **Maven** (for building the Spring Boot project).
- Install **Eclipse IDE** (or IntelliJ IDEA) for backend development.

### Backend Setup (Spring Boot Microservices)

1. Clone the project:

    ```bash
    git clone https://github.com/your-username/bank-management-web-project.git
    cd bank-management-web-project
    ```

2. Import each microservice into Eclipse as a Maven project.

3. Configure your **MySQL database**:

    - Create a database `bank_management_db`.
    - Update `application.yml` or `application.properties` files in each microservice to match your MySQL username and password.

4. Build and run each microservice:

    ```bash
    ./mvnw clean install
    ./mvnw spring-boot:run
    ```

    Example services to run:

    - `login-service`
    - `account-microservice`
    - `loan-microservice`
    - `api-gateway`
    - `eureka-server`

5. Make sure the **Eureka server** and **API Gateway** are running first.

### Frontend Setup (ReactJS)

1. Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Run the React app:

    ```bash
    npm start
    ```

4. Open your browser and go to:

    ```
    http://localhost:3000
    ```

### Default Ports

| Service                | Port |
|------------------------|------|
| Eureka Server          | 8761 |
| API Gateway            | 8080 |
| Login Service          | 8081 |
| Account Microservice   | 8082 |
| Loan Microservice      | 8084 |
| React Frontend         | 3000 |

## Conclusion

The Bank Management Web Project revolutionizes online banking by providing a secure, scalable, and user-friendly platform. It reduces reliance on manual banking operations and branch visits, improving both customer satisfaction and operational efficiency.

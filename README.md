# task_manager

A simple task management application for organizing and tracking your daily tasks.

## Features

- Create, read, update, and delete tasks
- Mark tasks as complete
- Organize tasks by priority

## Getting Started

### Prerequisites

- Node.js (v14 or higher)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the application: `npm start`

## Usage

Run the application and follow the on-screen prompts to manage your tasks.

## License

MIT

## Project Structure

This project demonstrates **Clean Architecture** principles with clear separation of concerns:

- **Entities**: Core business logic and rules
- **Use Cases**: Application-specific business rules
- **Interface Adapters**: Controllers, gateways, and presenters
- **Frameworks & Drivers**: Web frameworks, databases, and external tools

## Learning Objectives

This repository is designed to teach:

- Separation of concerns and layered architecture
- Dependency inversion and dependency injection
- Test-driven development practices
- Maintainability and scalability in application design

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│     Frameworks & Drivers (UI/DB)        │
├─────────────────────────────────────────┤
│     Interface Adapters (Controllers)    │
├─────────────────────────────────────────┤
│     Use Cases (Application Logic)       │
├─────────────────────────────────────────┤
│     Entities (Business Rules)           │
└─────────────────────────────────────────┘
```

## Contributing

Contributions and feedback are welcome! This is an educational project.

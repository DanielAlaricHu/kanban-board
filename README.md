# Kanban Board Application

## Project Overview
The Kanban Board application is a task management tool designed to help users organize and prioritize their work visually. Inspired by the Kanban methodology, this application allows users to create columns, add tasks, and rearrange them using drag-and-drop functionality. It is built with modern web technologies and integrates with cloud services for seamless data management.

This project serves as a hands-on exercise to deepen my understanding of React and Redux through real-world implementation. It also acts as a refresher on integrating Firebase Firestore for backendless data management. By building a functional Kanban board, I aimed to reinforce key concepts such as state management, component architecture, and real-time database interactions.

## Live Demo
The project can be tested at:  
[https://kanban-board-1bb6e.web.app](https://kanban-board-1bb6e.web.app)

## Frontend Technologies
- **React**: A JavaScript library for building user interfaces.
- **Redux**: State management for predictable application behavior.
- **Material-UI**: A React component library for implementing a responsive and visually appealing design.
- **React-DnD**: Enables drag-and-drop functionality for rearranging columns and tasks.
- **TypeScript**: Ensures type safety and improves code maintainability.

## Cloud Integration
- **Firebase Firestore**: Used for real-time database management, ensuring that column and task data is stored and synchronized across devices.
- **Firebase Authentication**: Provides secure user authentication and authorization.
- **Firebase Hosting**: Deploys the application to the cloud for fast and reliable access.

## Limitations
- **Offline Mode**: Currently, the application does not support offline functionality.
- **Advanced Task Features**: Subtasks, file attachments, and due dates are not yet implemented.
- **Team Collaboration**: The application is designed for individual use and does not support team collaboration.
- **Limited Columns**: Currently, the application only support upto 3 columns.

## Future Improvements
- **Offline Mode**: Implement offline support using service workers and local storage.
- **Advanced Task Features**: Add subtasks, file attachments, and due dates to enhance task management.
- **Team Collaboration**: Enable real-time collaboration for teams, including shared boards and task assignments.
- **Performance Optimization**: Improve drag-and-drop interactions with throttling and better state management.
- **Better Error Handling**: Error logging and report. Listen to Firestore call response before continue. Example: const response = await addColumnToFirestore(...)
- **Allow Column Order Rearrange**: In the manage column dialog.

## Setup Instructions
### Prerequisites
- Node.js and npm installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kanban-board.git
   ```
2. Navigate to the project directory:
   ```bash
   cd kanban-board
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`.

### Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

## License
This project is licensed under the MIT License.
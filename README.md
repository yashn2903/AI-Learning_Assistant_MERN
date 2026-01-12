
# AI-Learning Assistant (MERN)

The AI Learning Assistant is a full-stack web application designed to transform traditional PDF documents into interactive, AI-powered learning experiences. Built using the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS, the platform leverages Google Gemini AI to help users study smarter and more efficiently.

Users can upload PDF documents and instantly unlock powerful learning tools such as AI chat, auto-generated summaries, flashcards, and quizzes—all tailored to the document’s content. The application also includes progress tracking to help learners monitor their understanding and improvement over time.

This project focuses on enhancing productivity, improving comprehension, and making self-study more engaging through intelligent automation and a clean, modern UI.

![ecommerce-banner](https://github.com/yashn2903/AI-Learning_Assistant_MERN/blob/main/Frontend/src/assets/1.png)
![ecommerce-banner](https://github.com/yashn2903/AI-Learning_Assistant_MERN/blob/main/Frontend/src/assets/2.png)
![ecommerce-banner](https://github.com/yashn2903/AI-Learning_Assistant_MERN/blob/main/Frontend/src/assets/3.png)
![ecommerce-banner](https://github.com/yashn2903/AI-Learning_Assistant_MERN/blob/main/Frontend/src/assets/4.png)
![ecommerce-banner](https://github.com/yashn2903/AI-Learning_Assistant_MERN/blob/main/Frontend/src/assets/5.png)
![ecommerce-banner](https://github.com/yashn2903/AI-Learning_Assistant_MERN/blob/main/Frontend/src/assets/6.png)

## Project Setup

**Prerequisites**

- Node.js
- Mongodb Atlas
- Google Gemini AI key

### Install dependencies for frontend and backend separately

**Frontend:**
```bash
  npm install

  npm i axios lucide-react moment react-hot-toast react-markdown react-router-dom react-syntax-highlighter remark-gfm

```

**Backend:**
```bash
  npm install

  npm i bcryptjs cors dotenv express express-validator jsonwebtoken mongoose multer pdf-parse @google/genai 
```

## Environment Variables

**Backend**
- Create a `.env` file in the `backend` directory.
- Add the following variables with appropriate values

```bash
MONGODB_URI= "-------- Paste Your Mongo URI Here --------"

PORT= "-------- your PORT --------"

JWT_SECRET= "-------- Anything --------"

JWT_EXPIRE= "-------- ex(7d) --------"

NODE_ENV= "-------- development --------"

MAX_FILE_SIZE= "-------- 10485760 --------"

GEMINI_API_KEY= "-------- Paste Google Gemini AI API key --------"

```


## Running Development Servers

#### Start the backend server:
- Navigate to the `backend` directory: `cd backend`
- Start the server: `npm run server`
     
#### Start the frontend server:
- Navigate to the `frontend` & `admin` directory: `cd frontend`  / `cd admin`
- Start the server: `npm run dev`

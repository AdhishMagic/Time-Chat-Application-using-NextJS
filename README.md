## Time Chat Application

This project uses Next.js App Router with a src-based scalable architecture.

### Run locally

1. Install dependencies:

	npm install

2. Configure environment variables in `.env.local`:

	MONGODB_URI=mongodb://127.0.0.1:27017
	MONGODB_DB_NAME=time_chat_app

3. Start the dev server:

	npm run dev

### Main routes

- `/login`
- `/register`
- `/chat`
- `/api/test`

### Project structure

All application code is under `src/` with grouped routes in `src/app/(auth)` and `src/app/(chat)`.

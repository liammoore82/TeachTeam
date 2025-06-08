
# s4095280-s4062985-a2

Link to Github Repository: [https://github.com/rmit-fsd-2025-s1/s4095280-s4062985-a2](https://github.com/rmit-fsd-2025-s1/s4095280-s4062985-a2)

ERD is located at ../backend/docs

## Getting Started

This project consists of three components:
- Backend API (Express.js with TypeORM)
- Frontend (Next.js)
- Admin Dashboard (Next.js frontend + GraphQL backend)

### Installation

1. Install main backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install main frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

3. Install admin backend dependencies:
   ```bash
   cd ../admin/backend
   npm install
   ```

4. Install admin frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Project

**Important:** Start the backends before the frontends.

1. Start the main backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the admin backend server:
   ```bash
   cd admin/backend
   npm run dev
   ```

3. In a new terminal, start the main frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. In another terminal, start the admin dashboard:
   ```bash
   cd admin/frontend
   npm run dev
   ```

**Access Points:**
- Main Frontend: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3003`

### Running Tests

To run tests for the main frontend:
```bash
cd frontend
npm test
```

To run tests for the main backend:
```bash
cd backend
npm test
```

### References

#### Course Materials
- Lab Code from Weeks 8-10 were used

#### Documentation Sources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Documentation](https://expressjs.com/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Chakra UI Documentation](https://chakra-ui.com/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Recharts Documentation](https://recharts.org/en-US/)
- [React Icons Documentation](https://react-icons.github.io/react-icons/)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This is just an example app that demonstrates how to use Prisma, Apollo Client & Server, shadcn/ui, Tailwind, and NextJS to display data in a data-grid and performing CRUD operations using GraphQL mutations.

## Getting Started

First, setup your environment variables in the `.env` file in the root of the workspace. This file is ignored by git so that you don't accidentally commit your secrets and push them up to GitHub. If you plan on deploying this to a server, you'll need to configure these in the hosting provider's management portal or set them in your server environment.

```env
# Use this to login
MOCK_AUTH_TOKEN=mY_sUpe$ecr3t_t0k3n

# Configure with your postgres server details
DATABASE_URL="postgres://<username>:<password>@<db-server>:<db-port>/postgres?sslmode=require"
```

Next, generate the GraphQL and Prisma generated code:
```bash
npm run codegen
```

Then, seed the database with the data in the `mock-data` folder by running:
```bash
npx prisma db seed
```

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

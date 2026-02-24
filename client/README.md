# Project

## Client
Run client unit tests with `yarn test`

## Rules
This client directory manages the realtime database concerns as a pragmatic way of saving on creating a new project with all the configuration needed to run them.

### Tests
To run the rules tests:
1. Start the emulator: `yarn start:emulators`
1. Run the tests: `yarn test:rules`
The latter will build the rule.bolt file to the .json format used by the database and then run the tests.

### Deployment
`yarn deploy` pushes the rules.bolt (TODO right? or.json?) file to the firebase project.
If the command fails with "Error: Failed to get details for project: crossword-dev." you likely need to log out and back in with `yarn firebase logout` and `yarn firebase login`.

# Next.js bootstrap README content

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Firebase Rules Deployment


Deploy this project to Vercel and return the live URL.

Follow these steps exactly:

1. Check if the Vercel CLI is installed by running `vercel --version`. If not found, install it globally with `npm install -g vercel`.

2. Build the frontend with `npm run build` from the project root. Fix any build errors before continuing.

3. Deploy to Vercel using `vercel deploy --prod --yes` from the project root. If this is the first deploy, pass `--confirm` as well. Capture the output to extract the production URL.

4. Parse the deployment output for the production URL (the line that starts with "Production:" or ends in `.vercel.app`).

5. Report the live URL to the user clearly so they can open it in the browser.

Note: This project is a React + Vite SPA. The Express/SQLite backend runs separately and is NOT deployed by this command — only the frontend static build is deployed to Vercel.

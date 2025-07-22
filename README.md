
This project is a Next.js (React) web application for the Jain Society of San Diego.

## Deployment on Vercel

Follow these steps to deploy the project to [Vercel](https://vercel.com):

### 1. Prerequisites

- You need a [Vercel account](https://vercel.com/signup).
- Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Push Your Code to Git

If you haven't already, initialize a git repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Import Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** > **"Project"**.
3. Select your Git provider and repository.
4. Vercel will auto-detect Next.js and set the correct build settings.

### 4. Configure Environment Variables (if needed)

- If your project uses environment variables, add them in the **"Environment Variables"** section during setup.

### 5. Deploy

- Click **"Deploy"**.
- Wait for the build to finish. Your site will be live at `https://<your-project-name>.vercel.app`.

### 6. Subsequent Deployments

- Push changes to your Git repository. Vercel will automatically redeploy.

---

For more details, see the [Vercel documentation](https://vercel.com/docs).


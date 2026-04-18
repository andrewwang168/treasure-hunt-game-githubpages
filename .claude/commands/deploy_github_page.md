Deploy this project to GitHub Pages. Follow every step carefully and guide the user through any missing prerequisites.

---

## Step 1 — Check GitHub Authentication

Run this to test if a token is already configured in the git remote:
```
git remote get-url origin
```

If the remote URL does NOT contain a token (no `ghp_` in it), or there is no remote at all, ask the user:

> "請提供您的 GitHub Personal Access Token（需要 `repo` 權限）。
> 產生網址：https://github.com/settings/tokens/new
> 產生後請用 `! export GITHUB_TOKEN=ghp_你的token` 提供給我。"

Verify the token with:
```
curl -s -H "Authorization: token <TOKEN>" https://api.github.com/user
```
If the response contains `"login"`, the token is valid. Extract the GitHub username from the `login` field.

---

## Step 2 — Check if GitHub Repository Exists

Run:
```
git remote get-url origin
```

If there is **no remote origin**, ask the user for a repository name (suggest `claude_code_treasure_game` or a kebab-case slug), then:

1. Create the repo via API:
```
curl -s -X POST \
  -H "Authorization: token <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "<REPO_NAME>", "description": "Treasure Hunt Game", "private": false, "auto_init": false}' \
  https://api.github.com/user/repos
```

2. Set the remote:
```
git remote add origin https://<USERNAME>:<TOKEN>@github.com/<USERNAME>/<REPO_NAME>.git
```

3. Push the main branch:
```
git branch -M main
git push -u origin main
```

If a remote already exists, make sure it includes the token for authentication:
```
git remote set-url origin https://<USERNAME>:<TOKEN>@github.com/<USERNAME>/<REPO_NAME>.git
```

---

## Step 3 — Build the Frontend

Run:
```
npm run build
```

This outputs static files to the `build/` directory.

---

## Step 4 — Deploy to GitHub Pages

Push the `build/` folder to the `gh-pages` branch:

```bash
cd build
git init
git checkout -b gh-pages
git config user.email "your@email.com"
git config user.name "YourName"
git add -A
git commit -m "Deploy to GitHub Pages"
git push -f https://<USERNAME>:<TOKEN>@github.com/<USERNAME>/<REPO_NAME>.git gh-pages
cd ..
```

Then enable GitHub Pages via API (source: gh-pages branch):
```
curl -s -X POST \
  -H "Authorization: token <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source": {"branch": "gh-pages", "path": "/"}}' \
  https://api.github.com/repos/<USERNAME>/<REPO_NAME>/pages
```
(A `409` response means Pages is already enabled — that is fine.)

---

## Step 5 — Report Results

Tell the user:

- **GitHub 程式碼：** `https://github.com/<USERNAME>/<REPO_NAME>`
- **上線網頁（約 1 分鐘後生效）：** `https://<USERNAME>.github.io/<REPO_NAME>/`

Remind the user to revoke the token at https://github.com/settings/tokens after deployment is complete.

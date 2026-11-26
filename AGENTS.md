# Resume and project content

- Before updating biography, work experience, resume, or project content, consult the sibling repository `../Wohim-Resume` as the reference source. Both repositories live under the same parent directory; on this machine, the reference repository is `/Users/wohim/Desktop/DockerVol/ubuntu22.04/wohim/GitHub-Wohim/Wohim-Resume`.

# Publishing updates

- After completing and validating a repository update, review the diff and commit only files that belong to the task.
- For a routine update on `main`, run `git fetch origin` and check that the remote branch has no commits missing locally and that every outgoing commit belongs to the update. Push with `git push origin main`. If the user asks to keep changes local, follow that request.
- If the remote has diverged or GitHub requires a pull request, use the repository's normal branch and pull request flow. Never force-push `main`.
- A push to `main` triggers GitHub Pages. Confirm the remote commit and check the Pages deployment for that commit before reporting it as deployed.

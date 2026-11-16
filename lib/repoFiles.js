// Read and write the site's data files.
//
// Locally (npm run dev): the files on disk. You commit and push yourself.
// On Vercel (read-only filesystem): the GitHub repo via its API. A commit
// to the deploy branch triggers a Vercel rebuild, so changes go live in
// about two minutes.
//
// Env (Vercel): GITHUB_TOKEN (fine-grained, this repo only, Contents:
// read & write), GITHUB_REPO ("owner/name"), GITHUB_BRANCH (default "main").

import fs from "fs";
import path from "path";

const useLocalFiles = () => process.env.NODE_ENV === "development";

function gh() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) return null;
  return { token, repo, branch };
}

export function canWriteRepo() {
  return useLocalFiles() || !!gh();
}

async function ghFetch(cfg, apiPath, { method = "GET", body, accept = "application/vnd.github+json" } = {}) {
  // GITHUB_API_URL exists only so tests can point at a local stub.
  const api = process.env.GITHUB_API_URL || "https://api.github.com";
  const res = await fetch(`${api}/repos/${cfg.repo}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub ${method} ${apiPath} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  return accept.includes("raw") ? res.text() : res.json();
}

const encodePath = (p) => p.split("/").map(encodeURIComponent).join("/");

export async function readRepoFile(relPath) {
  if (useLocalFiles()) return fs.readFileSync(path.join(process.cwd(), relPath), "utf-8");
  const cfg = gh();
  if (!cfg) throw new Error("GITHUB_TOKEN / GITHUB_REPO not set.");
  return ghFetch(cfg, `/contents/${encodePath(relPath)}?ref=${encodeURIComponent(cfg.branch)}`, {
    accept: "application/vnd.github.raw+json",
  });
}

export async function listRepoDir(relPath) {
  if (useLocalFiles()) return fs.readdirSync(path.join(process.cwd(), relPath));
  const cfg = gh();
  if (!cfg) throw new Error("GITHUB_TOKEN / GITHUB_REPO not set.");
  const items = await ghFetch(cfg, `/contents/${encodePath(relPath)}?ref=${encodeURIComponent(cfg.branch)}`);
  return items.filter((i) => i.type === "file").map((i) => i.name);
}

// Write several files at once. On GitHub this is a single commit, so the
// board file and every index/metadata file land together or not at all.
export async function commitRepoFiles(files, message) {
  if (useLocalFiles()) {
    for (const [relPath, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(process.cwd(), relPath), content, "utf-8");
    }
    return { mode: "local" };
  }

  const cfg = gh();
  if (!cfg) throw new Error("GITHUB_TOKEN / GITHUB_REPO not set.");

  for (let attempt = 1; attempt <= 2; attempt++) {
    const ref = await ghFetch(cfg, `/git/ref/heads/${encodeURIComponent(cfg.branch)}`);
    const parentSha = ref.object.sha;
    const parent = await ghFetch(cfg, `/git/commits/${parentSha}`);
    const tree = await ghFetch(cfg, "/git/trees", {
      method: "POST",
      body: {
        base_tree: parent.tree.sha,
        tree: Object.entries(files).map(([p, content]) => ({ path: p, mode: "100644", type: "blob", content })),
      },
    });
    const commit = await ghFetch(cfg, "/git/commits", {
      method: "POST",
      body: { message, tree: tree.sha, parents: [parentSha] },
    });
    try {
      await ghFetch(cfg, `/git/refs/heads/${encodeURIComponent(cfg.branch)}`, {
        method: "PATCH",
        body: { sha: commit.sha, force: false },
      });
      return { mode: "github", sha: commit.sha };
    } catch (e) {
      // Someone pushed in between: retry once on top of the new head.
      if (attempt === 2) throw e;
    }
  }
}

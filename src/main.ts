import "./style.css";

// package metadata url: https://registry.npmjs.org/@scope/package/latest

async function fetchNpmDownloads(packageName: string) {
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/last-month/${packageName}`
  );

  if (!res.ok) {
    return;
  }

  return (await res.json()).downloads as number;
}

async function fetchGitHubStars(repoName: string) {
  const res = await fetch(`https://api.github.com/repos/${repoName}`);

  if (!res.ok) {
    return;
  }

  return (await res.json()).stargazers_count as number;
}

async function populateStats(
  dataField: string,
  fetchFN: (name: string) => Promise<number | void>
) {
  const $statsItems = document.querySelectorAll(
    `[data-${dataField}]`
  ) as NodeListOf<HTMLSpanElement>;

  for (const item of $statsItems) {
    const name = item.dataset[dataField] ?? "";
    const count = await fetchFN(name);

    if (count !== undefined) {
      item.innerText = new Intl.NumberFormat("en-US").format(count);
    }
  }
}

async function main() {
  populateStats("npm", fetchNpmDownloads);
  populateStats("github", fetchGitHubStars);
}

main();

const EXTENSION_ID = "DorianMassoulier.repomix-runner";
const [PUBLISHER, EXTENSION_NAME] = EXTENSION_ID.split(".");
const FALLBACK_STATS = {
  marketplaceInstalls: 14337,
  marketplaceRating: 5,
  marketplaceRatingCount: 0,
  ovsxRating: 5,
  ovsxRatingCount: 0,
};

const vscodeInstallsBadge = document.querySelector("[data-vscode-installs-badge]");
const vscodeRatingBadge = document.querySelector("[data-vscode-rating-badge]");
const ovsxRatingBadge = document.querySelector("[data-ovsx-rating-badge]");

function compactNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: value >= 10000 ? 1 : 0,
  }).format(value);
}

function starString(rating) {
  const filled = Math.round(rating);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function ratingMessage(rating, count) {
  return count > 0 ? `${starString(rating)} (${count})` : starString(rating);
}

async function getJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function fetchMarketplaceStats() {
  const data = await getJson(
    "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.2-preview.1",
    {
      method: "POST",
      headers: {
        accept: "application/json;api-version=7.2-preview.1;excludeUrls=true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        filters: [{ criteria: [{ filterType: 7, value: EXTENSION_ID }] }],
        flags: 0x100,
      }),
    },
  );

  const statistics = data.results?.[0]?.extensions?.[0]?.statistics ?? [];
  const stat = (name) =>
    statistics.find((s) => s.statisticName === name)?.value;

  return {
    installs: stat("install"),
    rating: stat("averagerating"),
    ratingCount: stat("ratingcount"),
  };
}

async function fetchOvsxStats() {
  const data = await getJson(
    `https://open-vsx.org/api/${PUBLISHER}/${EXTENSION_NAME}`,
  );
  return {
    rating: data.averageRating,
    ratingCount: data.reviewCount,
  };
}

function shieldBadgeUrl(label, message, { color, logo }) {
  const encodedLabel = encodeURIComponent(label).replaceAll("-", "--");
  const encodedMessage = encodeURIComponent(message).replaceAll("-", "--");
  return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}?style=flat-square&logo=${logo}&logoColor=white&labelColor=0d1117`;
}

const VSCODE_BADGE = { color: "007acc", logo: "visualstudiocode" };
const OVSX_BADGE = { color: "c160ef", logo: "eclipseide" };

async function renderBadges() {
  const vscode = await fetchMarketplaceStats().catch(() => ({}));

  const installs = Number.isFinite(vscode.installs)
    ? vscode.installs
    : FALLBACK_STATS.marketplaceInstalls;
  vscodeInstallsBadge.src = shieldBadgeUrl("VS Code", compactNumber(installs), VSCODE_BADGE);
  vscodeInstallsBadge.alt = `${compactNumber(installs)} VS Code Marketplace installs`;

  const vscodeRating = Number.isFinite(vscode.rating)
    ? vscode.rating
    : FALLBACK_STATS.marketplaceRating;
  const vscodeRatingCount = Number.isFinite(vscode.ratingCount)
    ? vscode.ratingCount
    : FALLBACK_STATS.marketplaceRatingCount;
  vscodeRatingBadge.src = shieldBadgeUrl(
    "Rating",
    ratingMessage(vscodeRating, vscodeRatingCount),
    VSCODE_BADGE,
  );
  vscodeRatingBadge.alt = `VS Code Marketplace rating ${vscodeRating.toFixed(1)}/5 (${vscodeRatingCount})`;

  const ovsx = await fetchOvsxStats().catch(() => ({}));
  const ovsxRating = Number.isFinite(ovsx.rating)
    ? ovsx.rating
    : FALLBACK_STATS.ovsxRating;
  const ovsxRatingCount = Number.isFinite(ovsx.ratingCount)
    ? ovsx.ratingCount
    : FALLBACK_STATS.ovsxRatingCount;
  ovsxRatingBadge.src = shieldBadgeUrl(
    "Rating",
    ratingMessage(ovsxRating, ovsxRatingCount),
    OVSX_BADGE,
  );
  ovsxRatingBadge.alt = `Open VSX rating ${ovsxRating.toFixed(1)}/5 (${ovsxRatingCount})`;
}

renderBadges();

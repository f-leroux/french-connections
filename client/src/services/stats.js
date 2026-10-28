// client/src/services/stats.js

// Cloudflare Worker in stats-worker/: anonymous totals of how each puzzle's games ended
const STATS_ENDPOINT = 'https://french-connections-stats.f-leroux.workers.dev';

// Both resolve to { played, solved } for the puzzle, or null when the Worker can't be reached:
// the stats are a bonus, the game never depends on them.
async function call(query, init) {
  try {
    const response = await fetch(`${STATS_ENDPOINT}${query}`, init);
    return response.ok ? await response.json() : null;
  } catch (e) {
    console.error('Error reaching the stats:', e);
    return null;
  }
}

export function sendResult(date, won, mistakes) {
  return call('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, won, mistakes }),
  });
}

export function fetchStats(date) {
  return call(`?date=${date}`);
}

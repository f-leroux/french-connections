// Counts how each day's puzzle went, so the site can show "X joueurs sur Y ont trouvé ce puzzle"
// at the end of a game. Only anonymous totals per puzzle are stored, in the D1 database bound as
// DB (see schema.sql). Deploy with `cd stats-worker && npx wrangler deploy`.

const ALLOWED_ORIGINS = ['https://www.frenchconnections.fr', 'https://frenchconnections.fr', 'http://localhost:3000'];
const DAY = 24 * 60 * 60 * 1000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Forbidden', { status: 403 });
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // GET ?date=YYYY-MM-DD: that puzzle's totals
    if (request.method === 'GET') {
      const date = new URL(request.url).searchParams.get('date');
      if (!DATE.test(date ?? '')) return reply(400, { message: 'invalid date' }, cors);
      return reply(200, await totals(env, date), cors);
    }

    // POST {date, won, mistakes}: one finished game, answered with the updated totals
    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return reply(400, { message: 'invalid JSON' }, cors);
      }
      const outcome = parseOutcome(body);
      if (!isCurrentPuzzle(body?.date) || !outcome) return reply(400, { message: 'invalid result' }, cors);
      await env.DB.prepare(
        `INSERT INTO results (date, outcome, count) VALUES (?1, ?2, 1)
         ON CONFLICT (date, outcome) DO UPDATE SET count = count + 1`
      ).bind(body.date, outcome).run();
      return reply(200, await totals(env, body.date), cors);
    }

    return reply(405, { message: 'method not allowed' }, cors);
  },
};

function reply(status, data, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Players get the puzzle of their local date, which is at most a day off from UTC's. A little
// more slack for a game started just before midnight; anything older or newer is junk.
function isCurrentPuzzle(date) {
  return typeof date === 'string' && DATE.test(date) && Math.abs(Date.parse(date) - Date.now()) < 2 * DAY;
}

function parseOutcome(body) {
  if (body?.won === false) return 'loss';
  if (body?.won === true && Number.isInteger(body.mistakes) && body.mistakes >= 0 && body.mistakes <= 3) {
    return `win-${body.mistakes}`;
  }
  return null;
}

async function totals(env, date) {
  const { results } = await env.DB.prepare('SELECT outcome, count FROM results WHERE date = ?1').bind(date).all();
  return {
    played: results.reduce((sum, row) => sum + row.count, 0),
    solved: results.filter(row => row.outcome !== 'loss').reduce((sum, row) => sum + row.count, 0),
  };
}

#!/usr/bin/env node

const webUrl = (process.env.SMOKE_WEB_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);
const apiUrl = (process.env.SMOKE_API_URL || '').replace(/\/$/, '');

async function check(name, url) {
  const started = Date.now();
  const res = await fetch(url, { redirect: 'follow' });
  const ms = Date.now() - started;
  if (res.status < 200 || res.status >= 400) {
    throw new Error(`${name} failed (${res.status}) — ${url}`);
  }
  console.log(`OK  ${name} (${res.status}, ${ms}ms) — ${url}`);
}

async function main() {
  const failures = [];

  for (const [name, url] of [
    ['Web home', webUrl],
    ['Web login', `${webUrl}/login`],
    ['Web register', `${webUrl}/register`],
  ]) {
    try {
      await check(name, url);
    } catch (error) {
      failures.push(error.message);
    }
  }

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/health`);
      const json = await res.json();
      if (res.status !== 200 || json?.data?.status !== 'ok') {
        throw new Error(`API health unexpected (${res.status})`);
      }
      console.log(`OK  API health — ${apiUrl}/health`);
    } catch (error) {
      failures.push(`API health: ${error.message}`);
    }
  }

  if (failures.length) {
    console.error('\nSmoke check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('\nAll smoke checks passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

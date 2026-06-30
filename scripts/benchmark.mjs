#!/usr/bin/env node

import process from 'node:process';
import { URL } from 'node:url';

const HELP = `
Benchmark your deployed host using autocannon.

Usage:
  npm run benchmark -- --url https://example.com

Options:
  --url <url>                 Base URL to test (required)
  --paths <csv>               Comma-separated paths (default: /, /en, /en/reports, /en/documents)
  --connections <n>           Concurrent connections (default: 50)
  --duration <seconds>        Test duration per path (default: 20)
  --pipelining <n>            HTTP pipelining factor (default: 1)
  --timeout <seconds>         Request timeout (default: 10)
  --warmup <seconds>          Warmup per path before measuring (default: 5)
  --method <method>           HTTP method (default: GET)
  --header <k:v>              Repeatable header, e.g. --header "Accept-Language: en"
  --fail-on-non2xx            Exit with code 1 if any non-2xx responses occur
  --no-render                 Disable realtime render (useful for CI)
  --json <file>               Write JSON summary to a file

Examples:
  npm run benchmark -- --url https://wdr26.org --connections 100 --duration 30
  npm run benchmark -- --url http://localhost:3000 --paths /,/en/wdr25/chapter-02
`;

function parseArgs(argv) {
  const args = {
    url: null,
    paths: ['/', '/en', '/en/reports/wdr25', '/en/reports/wdr25/chapter-02'],
    connections: 50,
    duration: 20,
    warmup: 5,
    pipelining: 1,
    timeout: 10,
    method: 'GET',
    headers: {},
    render: true,
    jsonFile: null,
    failOnNon2xx: false,
  };

  const nextValue = (i) => {
    if (i + 1 >= argv.length) throw new Error(`Missing value for ${argv[i]}`);
    return argv[i + 1];
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a === '--help' || a === '-h') return { ...args, help: true };
    if (a === '--no-render') {
      args.render = false;
      continue;
    }

    if (a === '--fail-on-non2xx') {
      args.failOnNon2xx = true;
      continue;
    }

    if (a === '--url') {
      args.url = nextValue(i);
      i++;
      continue;
    }
    if (a === '--paths') {
      const raw = nextValue(i);
      args.paths = raw
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      i++;
      continue;
    }
    if (a === '--connections') {
      args.connections = Number(nextValue(i));
      i++;
      continue;
    }
    if (a === '--duration') {
      args.duration = Number(nextValue(i));
      i++;
      continue;
    }
    if (a === '--warmup') {
      args.warmup = Number(nextValue(i));
      i++;
      continue;
    }
    if (a === '--pipelining') {
      args.pipelining = Number(nextValue(i));
      i++;
      continue;
    }
    if (a === '--timeout') {
      args.timeout = Number(nextValue(i));
      i++;
      continue;
    }
    if (a === '--method') {
      args.method = String(nextValue(i)).toUpperCase();
      i++;
      continue;
    }
    if (a === '--json') {
      args.jsonFile = nextValue(i);
      i++;
      continue;
    }
    if (a === '--header') {
      const raw = nextValue(i);
      const idx = raw.indexOf(':');
      if (idx === -1) throw new Error(`Invalid header format: ${raw} (expected k:v)`);
      const key = raw.slice(0, idx).trim();
      const value = raw.slice(idx + 1).trim();
      if (!key) throw new Error(`Invalid header key in: ${raw}`);
      args.headers[key] = value;
      i++;
      continue;
    }

    throw new Error(`Unknown argument: ${a}`);
  }

  return args;
}

function normalizeBaseUrl(raw) {
  const u = new URL(raw);
  // Ensure trailing slash behavior is consistent when joining.
  if (!u.pathname.endsWith('/')) u.pathname += '/';
  return u;
}

function absoluteUrl(base, path) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(p, base);
  // Preserve trailing slash if user explicitly included it.
  if (path.endsWith('/') && !url.pathname.endsWith('/')) url.pathname += '/';
  return url.toString();
}

function pickMetrics(result) {
  const latency = result?.latency || {};
  const requests = result?.requests || {};
  const throughput = result?.throughput || {};

  return {
    requestsPerSec: requests.average,
    throughputBytesPerSec: throughput.average,
    latencyMsAvg: latency.average,
    latencyMsP50: latency.p50,
    latencyMsP75: latency.p75,
    latencyMsP90: latency.p90,
    latencyMsP99: latency.p99,
    errors: result?.errors,
    timeouts: result?.timeouts,
    non2xx: result?.non2xx,
    totalRequests: requests.total,
    totalBytes: throughput.total,
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help) {
    process.stdout.write(HELP);
    return;
  }

  if (!args.url) {
    process.stderr.write('Missing required --url\n');
    process.stderr.write(HELP);
    process.exitCode = 2;
    return;
  }

  if (!Number.isFinite(args.connections) || args.connections <= 0) {
    throw new Error('--connections must be a positive number');
  }
  if (!Number.isFinite(args.duration) || args.duration <= 0) {
    throw new Error('--duration must be a positive number');
  }
  if (!Number.isFinite(args.warmup) || args.warmup < 0) {
    throw new Error('--warmup must be >= 0');
  }

  const base = normalizeBaseUrl(args.url);

  const { default: autocannon } = await import('autocannon');

  const results = [];

  for (const path of args.paths) {
    const target = absoluteUrl(base, path);

    if (args.warmup > 0) {
      process.stdout.write(`\nWarmup ${args.warmup}s: ${target}\n`);
      await autocannon({
        url: target,
        connections: Math.min(args.connections, 10),
        duration: args.warmup,
        pipelining: args.pipelining,
        timeout: args.timeout,
        method: args.method,
        headers: args.headers,
        renderProgressBar: false,
        renderResultsTable: false,
      });
    }

    process.stdout.write(`\nBenchmark ${args.duration}s @ ${args.connections} conns: ${target}\n`);

    const instance = autocannon({
      url: target,
      connections: args.connections,
      duration: args.duration,
      pipelining: args.pipelining,
      timeout: args.timeout,
      method: args.method,
      headers: args.headers,
      renderProgressBar: args.render,
      renderResultsTable: args.render,
    });

    if (args.render) {
      autocannon.track(instance, { renderProgressBar: true, renderResultsTable: true });
    }

    const result = await instance;
    results.push({ path, url: target, metrics: pickMetrics(result), raw: result });

    const m = pickMetrics(result);
    process.stdout.write(
      `Summary: rps=${Math.round(m.requestsPerSec || 0)} ` +
        `p50=${Math.round(m.latencyMsP50 || 0)}ms ` +
        `p99=${Math.round(m.latencyMsP99 || 0)}ms ` +
        `non2xx=${m.non2xx || 0} timeouts=${m.timeouts || 0} errors=${m.errors || 0}\n`,
    );
  }

  const summary = {
    baseUrl: base.toString(),
    timestamp: new Date().toISOString(),
    config: {
      paths: args.paths,
      connections: args.connections,
      duration: args.duration,
      warmup: args.warmup,
      pipelining: args.pipelining,
      timeout: args.timeout,
      method: args.method,
      headers: args.headers,
      failOnNon2xx: args.failOnNon2xx,
    },
    results,
  };

  if (args.jsonFile) {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(args.jsonFile, JSON.stringify(summary, null, 2), 'utf8');
    process.stdout.write(`\nWrote JSON summary to ${args.jsonFile}\n`);
  }

  // Exit with non-zero only for transport-level failures by default.
  // Use --fail-on-non2xx if you want HTTP status failures to fail the run.
  const hasTransportFailures = results.some((r) => {
    const m = r.metrics;
    return (m.timeouts || 0) > 0 || (m.errors || 0) > 0;
  });

  const hasHttpFailures = args.failOnNon2xx
    ? results.some((r) => (r.metrics.non2xx || 0) > 0)
    : false;

  if (hasTransportFailures || hasHttpFailures) process.exitCode = 1;
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + '\n');
  process.exit(1);
});

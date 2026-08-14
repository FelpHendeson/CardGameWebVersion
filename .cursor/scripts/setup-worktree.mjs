#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync('package.json')) {
  console.log('[cursor/worktree] package.json ainda não existe; nenhuma dependência para instalar.');
  process.exit(0);
}

if (!existsSync('pnpm-lock.yaml')) {
  console.log('[cursor/worktree] pnpm-lock.yaml ausente; executando pnpm install.');
  run('pnpm', ['install']);
  process.exit(0);
}

console.log('[cursor/worktree] instalando dependências com lockfile congelado.');
run('pnpm', ['install', '--frozen-lockfile']);

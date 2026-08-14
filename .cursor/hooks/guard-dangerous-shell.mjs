#!/usr/bin/env node
let input = '';
for await (const chunk of process.stdin) input += chunk;

let payload = {};
try {
  payload = JSON.parse(input || '{}');
} catch {
  console.log(JSON.stringify({ permission: 'allow' }));
  process.exit(0);
}

const command = String(payload.command ?? '');
const risky = [
  /git\s+reset\s+--hard\b/i,
  /git\s+clean\s+[^\n]*-[^\n]*f/i,
  /git\s+push\s+[^\n]*(--force(?:-with-lease)?|-f)(?:\s|$)/i,
  /git\s+branch\s+-D\b/i,
  /git\s+(?:restore|checkout)\s+(?:--\s+)?\.(?:\s|$)/i,
  /\brm\s+-[^\n]*r[^\n]*f[^\n]*\s/i,
  /\brm\s+-[^\n]*f[^\n]*r[^\n]*\s/i,
  /\brmdir\s+\/s\b/i,
  /\bdel\s+\/s\b/i,
  /Remove-Item\b[^\n]*(?:-Recurse|-Force)/i
];

if (risky.some((pattern) => pattern.test(command))) {
  console.log(JSON.stringify({
    permission: 'ask',
    user_message: 'Comando potencialmente destrutivo detectado. Revise antes de permitir.',
    agent_message: 'Não execute operações destrutivas de Git/arquivos sem aprovação explícita. Preserve alterações existentes.'
  }));
} else {
  console.log(JSON.stringify({ permission: 'allow' }));
}

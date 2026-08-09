import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFile, readFile, stat, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.join(root, "backend");
const frontend = path.join(root, "frontend");
const isWindows = process.platform === "win32";
const npm = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "npm";
const setupOnly = process.argv.includes("--setup-only");
const children = new Set();

const colors = {
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  cyan: "\u001b[36m",
  reset: "\u001b[0m",
};

function message(text, color = "reset") {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function npmArgs(args) {
  return isWindows ? ["/d", "/s", "/c", "npm", ...args] : args;
}

function readHidden(label) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      reject(
        new Error(
          "O terminal atual não permite digitação segura. Abra o PowerShell ou o terminal integrado do VS Code.",
        ),
      );
      return;
    }

    let value = "";
    const previousEncoding = process.stdin.readableEncoding;

    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      if (previousEncoding) process.stdin.setEncoding(previousEncoding);
    };

    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\u0003") {
          cleanup();
          process.stdout.write("\n");
          reject(new Error("Configuração cancelada."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (character === "\u0008" || character === "\u007f") {
          if (value.length) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (character >= " ") {
          value += character;
          process.stdout.write("*");
        }
      }
    };

    process.stdout.write(label);
    process.stdin.setEncoding("utf8");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function ensureJwtSecret(envPath) {
  let content = await readFile(envPath, "utf8");
  const match = content.match(/^JWT_SECRET\s*=\s*["']?([^\r\n"']*)["']?\s*$/m);
  const current = match?.[1]?.trim() ?? "";
  const invalid =
    current.length < 32 ||
    current.toLowerCase().includes("substitua") ||
    current.toLowerCase().includes("example");

  if (!invalid) return;

  const secret = randomBytes(48).toString("base64url");
  const line = `JWT_SECRET="${secret}"`;
  content = match
    ? content.replace(/^JWT_SECRET\s*=.*$/m, line)
    : `${content.trimEnd()}\n${line}\n`;
  await writeFile(envPath, content, "utf8");
  message(
    "JWT_SECRET ausente ou inválido: um novo segredo seguro foi configurado.",
    "yellow",
  );
}

async function ensureDatabaseUrl(envPath) {
  let content = await readFile(envPath, "utf8");
  const match = content.match(
    /^DATABASE_URL\s*=\s*["']?([^\r\n"']*)["']?\s*$/m,
  );
  const current = match?.[1]?.trim() ?? "";
  let databaseUrl;
  try {
    databaseUrl = new URL(current);
  } catch {
    throw new Error("DATABASE_URL ausente ou em formato inválido no backend/.env.");
  }

  const placeholder =
    databaseUrl.username === "user" ||
    databaseUrl.password === "password" ||
    !databaseUrl.username ||
    !databaseUrl.password;
  if (!placeholder) return false;
  if (!isWindows) {
    throw new Error("Configure as credenciais reais na DATABASE_URL do backend/.env.");
  }

  message(
    "A conexão com o PostgreSQL ainda usa os valores de exemplo.",
    "yellow",
  );
  message("Informe a senha do usuário postgres. Ela não será exibida.", "yellow");

  const host = databaseUrl.hostname || "localhost";
  const port = databaseUrl.port || "5432";
  const database = databaseUrl.pathname.replace(/^\//, "") || "emarket";
  const username = databaseUrl.username === "user" ? "postgres" : databaseUrl.username;
  const psql = "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";
  let password = "";
  let authenticated = false;

  const testConnection = (databaseName, command = "SELECT 1") =>
    spawnSync(
      psql,
      [
        "--host",
        host,
        "--port",
        port,
        "--username",
        username,
        "--dbname",
        databaseName,
        "--no-password",
        "--command",
        command,
      ],
      {
        encoding: "utf8",
        env: { ...process.env, PGPASSWORD: password },
        stdio: "pipe",
      },
    );

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    password = await readHidden(
      `Senha do PostgreSQL (${attempt}/3, Backspace para corrigir): `,
    );
    if (!password) {
      message("Nenhuma senha foi digitada.", "yellow");
      continue;
    }

    // Autentica primeiro no banco administrativo. Assim, uma senha válida não
    // é confundida com erro de banco ausente ou inacessível.
    const connectionTest = testConnection("postgres");
    if (connectionTest.status === 0) {
      authenticated = true;
      break;
    }

    const authenticationError = connectionTest.stderr ?? "";
    if (/password authentication failed|autentica.*senha falhou/i.test(authenticationError)) {
      message(
        "Senha incorreta para o usuário postgres. Tente novamente.",
        "red",
      );
      password = "";
      continue;
    }
    throw new Error(
      `O PostgreSQL recusou a conexão: ${authenticationError.trim() || "erro desconhecido"}`,
    );
  }

  if (!password || !authenticated) {
    throw new Error(
      "Não foi possível autenticar o usuário postgres após três tentativas.",
    );
  }

  const databaseTest = testConnection(database);
  if (databaseTest.status !== 0) {
    const databaseError = databaseTest.stderr ?? "";
    if (/does not exist|não existe|n.o existe/i.test(databaseError)) {
      throw new Error(
        `A senha foi aceita, mas o banco ${database} não existe. Nenhum banco foi criado; confira o nome em backend/.env.`,
      );
    } else {
      throw new Error(
        `A senha foi aceita, mas o banco ${database} não pôde ser acessado: ${databaseError.trim() || "erro desconhecido"}`,
      );
    }
  }

  databaseUrl.username = username;
  databaseUrl.password = password;
  const line = `DATABASE_URL="${databaseUrl.toString()}"`;
  content = content.replace(/^DATABASE_URL\s*=.*$/m, line);
  await writeFile(envPath, content, "utf8");
  message("Conexão PostgreSQL validada e salva no backend/.env.", "green");
}

function run(command, args, cwd, label) {
  return new Promise((resolve, reject) => {
    message(`\n[${label}] ${command} ${args.join(" ")}`, "cyan");
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      windowsHide: false,
      shell: false,
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} terminou com código ${code ?? "desconhecido"}.`));
    });
  });
}

function start(command, args, cwd, label) {
  message(`\n[${label}] iniciando...`, "cyan");
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    windowsHide: false,
    shell: false,
  });
  children.add(child);
  child.once("error", (error) => {
    message(`${label} não pôde ser iniciado: ${error.message}`, "red");
    shutdown(1);
  });
  child.once("exit", (code) => {
    children.delete(child);
    if (!stopping && code !== 0) {
      message(`${label} foi encerrado inesperadamente.`, "red");
      shutdown(code ?? 1);
    }
  });
  return child;
}

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function waitFor(url, label, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_500) });
      if (response.ok || response.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  throw new Error(`${label} não respondeu em ${url}. Verifique as mensagens acima.`);
}

async function prepare() {
  message("E-Market - preparação do ambiente", "green");

  const backendEnv = path.join(backend, ".env");
  if (!(await exists(backendEnv))) {
    await copyFile(path.join(backend, ".env.example"), backendEnv);
    throw new Error(
      "O arquivo backend/.env foi criado. Configure DATABASE_URL e JWT_SECRET e execute npm run dev novamente.",
    );
  }
  await ensureJwtSecret(backendEnv);
  if (!(await isPortOpen(5432))) {
    throw new Error(
      "O PostgreSQL não está respondendo na porta 5432. Inicie o serviço do banco e tente novamente.",
    );
  }
  await ensureDatabaseUrl(backendEnv);

  const frontendEnv = path.join(frontend, ".env.local");
  if (!(await exists(frontendEnv))) {
    await copyFile(path.join(frontend, ".env.example"), frontendEnv);
  }

  for (const [directory, label] of [
    [backend, "dependências do backend"],
    [frontend, "dependências do frontend"],
  ]) {
    if (!(await exists(path.join(directory, "node_modules")))) {
      await run(npm, npmArgs(["install"]), directory, label);
    }
  }

  const generatedClient = path.join(
    backend,
    "node_modules",
    ".prisma",
    "client",
    "index.js",
  );
  if (setupOnly || !(await exists(generatedClient))) {
    await run(npm, npmArgs(["run", "db:generate"]), backend, "Prisma Client");
  }
  await run(npm, npmArgs(["run", "db:migrate"]), backend, "Banco de dados");
}

let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill();
  setTimeout(() => process.exit(code), 250).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

try {
  await prepare();

  if (setupOnly) {
    message("\nAmbiente preparado com sucesso.", "green");
    process.exit(0);
  }

  if (await isPortOpen(3000)) {
    throw new Error("A porta 3000 já está ocupada. Feche o processo antigo da API e tente novamente.");
  }
  if (await isPortOpen(3001)) {
    throw new Error("A porta 3001 já está ocupada. Feche o processo antigo do site e tente novamente.");
  }

  start(npm, npmArgs(["run", "start"]), backend, "API");
  await waitFor("http://127.0.0.1:3000", "A API");

  start(npm, npmArgs(["run", "dev"]), frontend, "SITE");
  await waitFor("http://127.0.0.1:3001/login", "O site");

  message("\nE-Market iniciado com sucesso.", "green");
  message("Site: http://127.0.0.1:3001", "green");
  message("API:  http://127.0.0.1:3000", "green");
  message("Pressione Ctrl+C para encerrar os dois servidores.\n", "yellow");
} catch (error) {
  message(`\nNão foi possível iniciar o E-Market: ${error.message}`, "red");
  shutdown(1);
}

// Moteur de stockage : un fichier JSON par collection dans data/ (même principe que Beach Tennis Bénin).
//
// • Lecture : le fichier est relu dès qu'il change sur le disque (y compris s'il est modifié à la main),
//   sinon la copie en mémoire est utilisée.
// • Écriture : immédiate, atomique (fichier temporaire puis renommage) et tolérante aux verrous
//   passagers de Windows (antivirus, OneDrive).
// • Les dates sont des objets Date en mémoire et des chaînes ISO dans les fichiers.
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

type Row = { id: string };
type Pred<T> = (row: T) => boolean;
type Patch<T> = Partial<Omit<T, "id">> | ((row: T) => Partial<Omit<T, "id">>);

/** Les champs « undefined » d'une modification sont ignorés (la valeur enregistrée est conservée) */
function defined<P extends object>(patch: P): P {
  return Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as P;
}

/** Pause synchrone courte, pour réessayer une écriture bloquée */
function pause(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Écrit un fichier de façon atomique, avec reprise en cas de verrou (EPERM / EBUSY / EACCES sous Windows) */
export function writeFileAtomic(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      fs.writeFileSync(tmp, content, "utf8");
      fs.renameSync(tmp, file);
      return;
    } catch (e) {
      lastError = e;
      pause(40 * (attempt + 1));
    }
  }
  try {
    fs.writeFileSync(file, content, "utf8"); // dernier recours : écriture directe
    fs.rmSync(tmp, { force: true });
  } catch {
    throw lastError;
  }
}

export class Collection<T extends Row, D extends keyof T = never> {
  private rows: T[] | null = null;
  private stamp = "";

  constructor(
    readonly name: string,
    private readonly opts: { dates?: (keyof T)[]; defaults?: () => Pick<T, D> } = {}
  ) {}

  get file() {
    return path.join(DATA_DIR, `${this.name}.json`);
  }

  private revive(raw: Record<string, unknown>): T {
    // champs absents (fichier ancien ou modifié à la main) : valeur par défaut
    const row = { ...(this.opts.defaults?.() ?? {}), ...raw } as Record<string, unknown>;
    for (const k of this.opts.dates ?? []) {
      const v = row[k as string];
      if (typeof v === "string" || typeof v === "number") row[k as string] = new Date(v);
    }
    return row as T;
  }

  private load(): T[] {
    let stat: fs.Stats | null = null;
    try {
      stat = fs.statSync(this.file);
    } catch {
      stat = null;
    }
    const stamp = stat ? `${stat.mtimeMs}:${stat.size}` : "absent";
    if (this.rows && stamp === this.stamp) return this.rows;
    if (!stat) {
      this.rows = [];
    } else {
      let parsed: unknown;
      try {
        parsed = JSON.parse(fs.readFileSync(this.file, "utf8"));
      } catch (e) {
        throw new Error(
          `Le fichier data/${this.name}.json est illisible (${(e as Error).message}). ` +
            "Corrigez-le, restaurez-le depuis data/sauvegardes/ ou lancez « npm run reset »."
        );
      }
      this.rows = Array.isArray(parsed) ? parsed.map((r) => this.revive(r as Record<string, unknown>)) : [];
    }
    this.stamp = stamp;
    return this.rows;
  }

  private save(rows: T[]) {
    writeFileAtomic(this.file, JSON.stringify(rows, null, 2) + "\n");
    this.rows = rows;
    try {
      const stat = fs.statSync(this.file);
      this.stamp = `${stat.mtimeMs}:${stat.size}`;
    } catch {
      this.stamp = "";
    }
  }

  // ── Lecture ────────────────────────────────────────────────────────────────
  /** Toutes les lignes (copies : modifier le résultat ne modifie pas la base) */
  all(): T[] {
    return this.load().map((r) => ({ ...r }));
  }
  get(id: string | null | undefined): T | undefined {
    if (!id) return undefined;
    const r = this.load().find((x) => x.id === id);
    return r ? { ...r } : undefined;
  }
  find(pred: Pred<T>): T | undefined {
    const r = this.load().find(pred);
    return r ? { ...r } : undefined;
  }
  filter(pred: Pred<T>): T[] {
    return this.load().filter(pred).map((r) => ({ ...r }));
  }
  count(pred?: Pred<T>): number {
    const rows = this.load();
    return pred ? rows.filter(pred).length : rows.length;
  }
  sum(field: keyof T, pred?: Pred<T>): number {
    return this.load()
      .filter(pred ?? (() => true))
      .reduce((s, r) => s + (Number(r[field]) || 0), 0);
  }

  // ── Écriture ───────────────────────────────────────────────────────────────
  insert(data: Omit<T, D | "id"> & Partial<Pick<T, D | "id">>): T {
    const row = { id: randomUUID(), ...(this.opts.defaults?.() ?? {}), ...data } as T;
    // les champs explicitement « undefined » prennent la valeur par défaut
    const defaults = (this.opts.defaults?.() ?? {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(row)) if (v === undefined && k in defaults) (row as Record<string, unknown>)[k] = defaults[k];
    this.save([...this.load(), row]);
    return { ...row };
  }
  insertMany(list: (Omit<T, D | "id"> & Partial<Pick<T, D | "id">>)[]): T[] {
    const rows = list.map((data) => ({ id: randomUUID(), ...(this.opts.defaults?.() ?? {}), ...data }) as T);
    if (rows.length) this.save([...this.load(), ...rows]);
    return rows.map((r) => ({ ...r }));
  }
  update(id: string, patch: Patch<T>): T | undefined {
    const rows = this.load();
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return undefined;
    const p = defined(typeof patch === "function" ? patch({ ...rows[i] }) : patch);
    const next = rows.slice();
    next[i] = { ...rows[i], ...p, id: rows[i].id };
    this.save(next);
    return { ...next[i] };
  }
  updateWhere(pred: Pred<T>, patch: Patch<T>): number {
    const rows = this.load();
    let n = 0;
    const next = rows.map((r) => {
      if (!pred(r)) return r;
      n++;
      const p = defined(typeof patch === "function" ? patch({ ...r }) : patch);
      return { ...r, ...p, id: r.id };
    });
    if (n) this.save(next);
    return n;
  }
  remove(id: string): boolean {
    return this.removeWhere((r) => r.id === id) > 0;
  }
  removeWhere(pred: Pred<T>): number {
    const rows = this.load();
    const next = rows.filter((r) => !pred(r));
    const n = rows.length - next.length;
    if (n) this.save(next);
    return n;
  }
  /** Remplace tout le contenu (données de démonstration, restauration) */
  replaceAll(rows: T[]) {
    this.save(rows.map((r) => ({ ...r })));
  }
}

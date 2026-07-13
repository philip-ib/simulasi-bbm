import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data.db");

let db = null;

// Wrapper yang auto-save ke disk setelah write
function wrapDb(sqlDb) {
  const save = () => {
    const buffer = sqlDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(buffer));
  };

  return {
    raw: sqlDb,

    exec(sql) {
      return sqlDb.exec(sql);
    },

    prepare(sql) {
      const stmt = sqlDb.prepare(sql);
      return {
        run(...params) {
          stmt.bind(params);
          stmt.step();
          stmt.free();
          const changes = sqlDb.getRowsModified();
          // Dapatkan lastInsertRowid SEBELUM save() karena export() meresetnya
          const idResult = sqlDb.exec("SELECT last_insert_rowid() AS id");
          const lastInsertRowid = idResult.length > 0 ? idResult[0].values[0][0] : 0;
          save();
          return { changes, lastInsertRowid };
        },
        get(...params) {
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },
        all(...params) {
          stmt.bind(params);
          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        },
      };
    },

    getRowsModified() {
      return sqlDb.getRowsModified();
    },

    close() {
      sqlDb.close();
    },
  };
}

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = wrapDb(new SQL.Database(buffer));
  } else {
    db = wrapDb(new SQL.Database());
  }

  db.raw.run("PRAGMA foreign_keys = ON");
  return db;
}

export { getDb };

import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';

const SQLITE_DB = 'sqlite';
const SAVED_UNITS_TABLE = 'units';

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return SQLite.openDatabase({name: SQLITE_DB, location: 'default'});
};

// create units table
export async function createTable(database: SQLiteDatabase) {
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS ${SAVED_UNITS_TABLE}
       (
         id           INTEGER PRIMARY KEY AUTOINCREMENT,
         unit_id      VARCHAR(100),
         data         JSON NOT NULL,
         isLiked      BOOLEAN DEFAULT 0
       )`,
  );
}

// remove unit from database
export async function removeUnit(database: SQLiteDatabase, unitId: string) {
  await database.executeSql(
    `DELETE FROM ${SAVED_UNITS_TABLE} WHERE unit_id = ?`,
    [unitId],
  );
}

// fetch all units from database
export async function fetchUnits(database: SQLiteDatabase) {
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${SAVED_UNITS_TABLE}`,
        [],
        (_, {rows}) => {
          resolve(rows);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';

const SQLITE_DB = 'sqlite';
const SAVED_UNITS_TABLE = 'units';

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return SQLite.openDatabase({name: SQLITE_DB, location: 'default'});
};

// create units table
export async function createTable() {
  const database = await getDBConnection();

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

// save unit to database
export async function saveUnit(unitId: string, data: any) {
  const database = await getDBConnection();

  await createTable();

  await database.executeSql(
    `INSERT INTO ${SAVED_UNITS_TABLE} (unit_id, data, isLiked) VALUES (?, ?, ?)`,
    [unitId, JSON.stringify(data), 1],
  );
}

// remove unit from database
export async function removeUnit(unitId: string) {
  const database = await getDBConnection();

  await database.executeSql(
    `DELETE FROM ${SAVED_UNITS_TABLE} WHERE unit_id = ?`,
    [unitId],
  );
}

export interface ISavedUnit {
  id: number;
  unit_id: string;
  data: Object;
  isLiked: boolean;
}
// fetch all units from database
export async function fetchUnits(): Promise<ISavedUnit[]> {
  const database = await getDBConnection();

  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${SAVED_UNITS_TABLE}`,
        [],
        (_, {rows}) => {
          const savedUnits = [];

          for (let i = 0; i < rows?.length; i++) {
            const currentRow = rows.item(i);

            let unit = {
              ...currentRow,
              data: currentRow?.data ? JSON.parse(currentRow?.data) : null,
            };

            savedUnits.push(unit);
          }

          resolve(savedUnits);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

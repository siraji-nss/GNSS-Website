export function rowsToObjects(resultSet) {
  return resultSet.rows.map((row) => {
    const obj = {};
    resultSet.columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

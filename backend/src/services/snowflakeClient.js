// In the future, this will wrap the real snowflake-sdk connection.
// For now we mock it so the rest of the code can be written as if Snowflake exists.

export const snowflakeClient = {
  query: async (sql, params = []) => {
    console.log('[Snowflake MOCK] SQL:', sql, 'PARAMS:', params);
    return []; // pretend we got no rows back
  }
};

exports.getDatabase = (tenantId) => {
  const isValidUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      tenantId
    );

  if (!isValidUuid) {
    throw new Error("Invalid UUID provided");
  }

  const dbName = `client_${tenantId.replace(/-/g, "_")}`;
  return dbName;
};

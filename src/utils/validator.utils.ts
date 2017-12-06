
const objectIdRegex = new RegExp("^[0-9a-fA-F]{24}$");

export const isValidObjectId = (id: string) => objectIdRegex.test(id);
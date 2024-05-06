import bcrypt from "bcryptjs";

export { bcrypt };

/**
 * The expiration time for a session, in milliseconds.
 * By default, it is set to 30 days.
 */
export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;

export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

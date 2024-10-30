import bcryptjs from "bcryptjs";

async function hash(password: string) {
  return await bcryptjs.hash(password, getNumberOfSaltRounds());
}

async function compare(providedPassword: string, storedPassword: string) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

function getNumberOfSaltRounds() {
  const saltRounds = 1;

  return saltRounds;
}

export default Object.freeze({
  hash,
  compare,
});

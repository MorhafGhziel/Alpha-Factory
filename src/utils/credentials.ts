/**
 * Utility functions for generating random usernames and passwords
 */

/**
 * Generate a random username based on name and role
 */
export function generateUsername(name: string, role: string): string {
  // Clean the name (remove spaces, special characters)
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toLowerCase();

  // Take first 4-6 characters of name
  const namePrefix = cleanName.substring(0, Math.min(6, cleanName.length));

  // Role prefix (first 3 letters)
  const rolePrefix = role.substring(0, 3).toLowerCase();

  // Random 3-digit number
  const randomNum = Math.floor(100 + Math.random() * 900);

  return `${namePrefix}${rolePrefix}${randomNum}`;
}

/**
 * Generate a secure random password
 */
export function generatePassword(): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest with random characters (total length: 12)
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Generate credentials for a user
 */
export function generateCredentials(
  name: string,
  role: string
): {
  username: string;
  password: string;
} {
  return {
    username: generateUsername(name, role),
    password: generatePassword(),
  };
}

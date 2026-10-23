import bcrypt from 'bcrypt';

/**
 * Service to handle secure password hashing and comparison
 */
export class PasswordService {
  /**
   * Hashes a plain text password using bcrypt
   * @param {string} plainPassword - The password to hash
   * @returns {Promise<string>} The resulting bcrypt hash
   */
  static async hashPassword(plainPassword) {
    const saltRounds = 10; // 10 is the industry standard — fast (~100ms) but still 2^10 rounds secure
    return bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password
   * @param {string} plainPassword - The user-provided password
   * @param {string} hashedPassword - The stored bcrypt hash
   * @returns {Promise<boolean>} True if passwords match, false otherwise
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

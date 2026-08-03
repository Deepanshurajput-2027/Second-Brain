import crypto from 'crypto';
import { UserRepository } from '../users/user.repository.js';
import { PasswordService } from './password.service.js';
import { JwtService } from './jwt.service.js';
import { sendPasswordResetEmail } from '../../utils/email/email.service.js';
import { ApiError } from '../../shared/errors/ApiError.js';

/**
 * Service orchestrating authentication business logic
 */
export class AuthService {
  /**
   * Register a new user
   * @param {Object} userData
   * @returns {Promise<Object>} The created user without the password
   * @throws {ApiError} If user already exists
   */
  static async register(userData) {
    const { email, password, fullName } = userData;

    // 1. Check if user exists
    const userExists = await UserRepository.exists({ email });
    if (userExists) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // 2. Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // 3. Create user
    const newUser = await UserRepository.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // 4. Return user without password
    // (Mongoose schema toJSON/toObject transforms will automatically strip the password,
    // but calling toObject ensures we return a clean plain object)
    return newUser.toObject ? newUser.toObject() : newUser;
  }

  /**
   * Login an existing user
   * @param {string} email
   * @param {string} plainPassword
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   * @throws {ApiError} If credentials are invalid
   */
  static async login(email, plainPassword) {
    // 1. Find user by email with password included in projection
    const user = await UserRepository.findByEmail(email, '+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 2. Compare password
    const isMatch = await PasswordService.comparePassword(plainPassword, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 3. Generate tokens
    const payload = { sub: user._id, role: user.role };
    const { accessToken, refreshToken } = JwtService.generateTokens(payload);

    // 4. Save refresh token to user document
    await UserRepository.update(user._id, { refreshToken });

    // 5. Return user and tokens
    const userWithoutPassword = user.toObject ? user.toObject() : user;
    if (userWithoutPassword.password) {
      delete userWithoutPassword.password; // Fallback to ensure password is stripped
    }

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh the authentication tokens
   * @param {string} incomingRefreshToken
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   * @throws {ApiError} If token is invalid or user mismatch
   */
  static async refreshAuth(incomingRefreshToken) {
    // 1. Verify token
    const decoded = JwtService.verifyRefreshToken(incomingRefreshToken);

    // 2. Find user by decoded ID
    const user = await UserRepository.findById(decoded.sub);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Check if the refresh token matches the one in DB
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // 3. Generate new tokens
    const payload = { sub: user._id, role: user.role };
    const { accessToken, refreshToken } = JwtService.generateTokens(payload);

    // 4. Update the new refresh token in DB
    await UserRepository.update(user._id, { refreshToken });

    // 5. Return new tokens
    return { accessToken, refreshToken };
  }

  /**
   * Logout user by clearing the refresh token
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async logout(userId) {
    // 1. Update the user in DB, setting refreshToken to null
    await UserRepository.update(userId, { refreshToken: null });
  }

  /**
   * Request password reset token and send reset email
   * @param {string} email
   * @returns {Promise<void>}
   */
  static async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Return quietly to prevent email enumeration
      return;
    }

    // Generate unhashed random token and SHA-256 hash for storage
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserRepository.update(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires,
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (err) {
      console.error('Failed to send password reset email:', err.message);
    }
  }

  /**
   * Reset user password using token
   * @param {string} token - Unhashed reset token from URL
   * @param {string} newPassword - Plain text new password
   * @returns {Promise<void>}
   * @throws {ApiError} If token is invalid or expired
   */
  static async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserRepository.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, 'Password reset token is invalid or has expired');
    }

    const hashedPassword = await PasswordService.hashPassword(newPassword);

    await UserRepository.update(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null, // Clear active refresh session for security
    });
  }
}

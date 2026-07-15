import jwt from 'jsonwebtoken';
import { ApiError } from '../../shared/errors/ApiError.js';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from './auth.constants.js';

/**
 * Service to handle generation and verification of JSON Web Tokens
 */
export class JwtService {
  /**
   * Generates both an access token and a refresh token for a given payload
   * @param {Object} payload - Data to encode in the token
   * @returns {{ accessToken: string, refreshToken: string }} The generated tokens
   */
  static generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Internal helper to handle jsonwebtoken verification errors
   * @param {Error} err - Error thrown by jwt.verify
   * @throws {ApiError} 401 ApiError with specific message
   */
  static _handleVerifyError(err) {
    if (err instanceof jwt.TokenExpiredError || err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired');
    }
    if (err instanceof jwt.JsonWebTokenError || err.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    }
    throw new ApiError(401, 'Authentication failed');
  }

  /**
   * Verifies an access token
   * @param {string} token - The access token to verify
   * @returns {Object} The decoded payload
   * @throws {ApiError} If token is invalid or expired
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      this._handleVerifyError(err);
    }
  }

  /**
   * Verifies a refresh token
   * @param {string} token - The refresh token to verify
   * @returns {Object} The decoded payload
   * @throws {ApiError} If token is invalid or expired
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      this._handleVerifyError(err);
    }
  }
}

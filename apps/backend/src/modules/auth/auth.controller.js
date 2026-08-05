import { AuthService } from './auth.service.js';
import { JwtService } from './jwt.service.js';
import { asyncHandler } from '../../utils/helpers/asyncHandler.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
};

export const registerHandler = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body);
  return successResponse(res, 201, 'User registered successfully', { user });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login(email, password);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  return successResponse(res, 200, 'Login successful', { user, accessToken });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.token;

  const { accessToken, refreshToken } = await AuthService.refreshAuth(token);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  return successResponse(res, 200, 'Token refreshed successfully', { accessToken });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.token;

  if (token) {
    try {
      // Decode token to extract userId for DB update
      const decoded = JwtService.verifyRefreshToken(token);
      await AuthService.logout(decoded.sub);
    } catch (error) {
      // If token is invalid or expired, we still want to clear the cookie and succeed
    }
  }

  res.clearCookie('refreshToken', clearCookieOptions);
  return successResponse(res, 200, 'Logout successful');
});

export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await AuthService.forgotPassword(email);
  return successResponse(
    res,
    200,
    'If an account exists with that email, a password reset link has been sent.'
  );
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const token = req.params.token || req.body.token;
  const newPassword = req.body.newPassword || req.body.password;
  await AuthService.resetPassword(token, newPassword);
  return successResponse(res, 200, 'Password has been reset successfully');
});


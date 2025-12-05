const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, location, college } = req.body;

  // Check if user already exists with this email and role combination
  const existingUser = await User.findOne({ email, role: role || 'student' });
  if (existingUser) {
    return next(new ErrorResponse(`Account already exists with this email for ${role || 'student'} role`, 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    phone,
    location,
    college: role === 'student' ? college : undefined
  });

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  let user;
  if (role) {
    // If role is specified, find user with specific role
    user = await User.findOne({ email, role }).select('+password');
  } else {
    // If no role specified, find any user with this email (for backward compatibility)
    const users = await User.find({ email }).select('+password');

    if (users.length === 0) {
      return next(new ErrorResponse('Invalid credentials', 401));
    } else if (users.length === 1) {
      // Only one account with this email
      user = users[0];
    } else {
      // Multiple accounts, return error asking to specify role
      const roles = users.map(u => u.role);
      return next(new ErrorResponse(`Multiple accounts found. Please specify role: ${roles.join(', ')}`, 400));
    }
  }

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res, 'User logged in successfully');
});

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      college: user.college,
      profileImage: user.profileImage,
      verified: user.verified,
      rating: user.rating,
      totalRatings: user.totalRatings,
      createdAt: user.createdAt
    }
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    location: req.body.location
  };

  // Only update college if user is a student
  if (req.user.role === 'student' && req.body.college) {
    fieldsToUpdate.college = req.body.college;
  }

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'User details updated successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      college: user.college,
      profileImage: user.profileImage,
      verified: user.verified,
      rating: user.rating,
      totalRatings: user.totalRatings
    }
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // For now, just return a success message
  // In production, you would generate a reset token and send email
  res.status(200).json({
    success: true,
    message: 'Password reset functionality will be implemented with email service'
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // For now, just return a success message
  // In production, you would verify the reset token and update password
  res.status(200).json({
    success: true,
    message: 'Password reset functionality will be implemented'
  });
});

// @desc    DEV ONLY: reset password by email (local use)
// @route   POST /api/v1/auth/dev-reset
// @access  Public (disabled in production)
exports.devReset = asyncHandler(async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return next(new ErrorResponse('Not available in production', 403));
  }
  const { email, role, newPassword } = req.body;
  if (!email || !newPassword) {
    return next(new ErrorResponse('Provide email and newPassword', 400));
  }
  const user = await User.findOne(role ? { email, role } : { email }).select('+password');
  if (!user) return next(new ErrorResponse('User not found', 404));
  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password updated for dev' });
});

// @desc    Check available roles for an email
// @route   POST /api/v1/auth/check-roles
// @access  Public
exports.checkRoles = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new ErrorResponse('Please provide an email', 400));
  }

  const users = await User.find({ email }, 'role');
  const roles = users.map(user => user.role);

  res.status(200).json({
    success: true,
    data: {
      email,
      availableRoles: roles,
      hasMultipleRoles: roles.length > 1
    }
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
          college: user.college,
          profileImage: user.profileImage,
          verified: user.verified,
          rating: user.rating,
          totalRatings: user.totalRatings
        }
      }
    });
};
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterData, OtpVerification } from '../../types';
import * as api from '../../services/api';

// Get user info from local storage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo') || '{}')
  : null;

// Async thunks
export const login = createAsyncThunk(
  'user/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await api.loginUser(credentials);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      return await api.registerUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'user/verifyOtp',
  async (verificationData: OtpVerification, { rejectWithValue }) => {
    try {
      console.log('Sending OTP verification data to API:', verificationData);
      const data = await api.verifyOTP(verificationData);
      console.log('OTP verification response:', data);
      
      // Only store user info in localStorage if we have a valid response with a token
      if (data && data.token) {
        console.log('Saving user info to localStorage');
        localStorage.setItem('userInfo', JSON.stringify(data));
      } else {
        console.warn('No token received in OTP verification response');
      }
      
      return data;
    } catch (error: any) {
      console.error('OTP verification error in thunk:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        'Xác thực OTP thất bại. Vui lòng kiểm tra mã OTP và thử lại.'
      );
    }
  }
);

export const getUserDetails = createAsyncThunk(
  'user/getUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getUserProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin người dùng thất bại');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData: Partial<RegisterData>, { rejectWithValue, getState }) => {
    try {
      console.log('Updating user profile with data:', userData);
      
      // Get current state to access current user info
      const state = getState() as { user: { userInfo: User } };
      const currentUserInfo = state.user.userInfo;
      
      // Call API to update user profile
      const data = await api.updateUserProfile(userData);
      console.log('User profile update response:', data);
      
      // Make sure we keep the token if the response doesn't include it
      if (data && !data.token && currentUserInfo?.token) {
        data.token = currentUserInfo.token;
      }
      
      // Store the updated user info in localStorage
      if (data) {
        const updatedUserInfo = { ...currentUserInfo, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        console.log('Updated user info in localStorage:', updatedUserInfo);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error updating user profile:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        'Cập nhật thông tin thất bại. Vui lòng thử lại sau.'
      );
    }
  }
);

interface UserState {
  userInfo: User | null;
  loading: boolean;
  error: string | null;
  isRegistered: boolean;
  userId: string | null;
  success: boolean;
  verificationSuccess: boolean;
}

const initialState: UserState = {
  userInfo: userInfoFromStorage,
  loading: false,
  error: null,
  isRegistered: false,
  userId: null,
  success: false,
  verificationSuccess: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
      state.error = null;
      state.isRegistered = false;
      state.success = false;
      state.verificationSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
      state.verificationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.success = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isRegistered = true;
        state.userId = action.payload.userId;
        state.success = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationSuccess = false;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isRegistered = false;
        state.userId = null;
        state.verificationSuccess = true;
        state.success = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.verificationSuccess = false;
      })
      // Get user details
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserDetails.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.userInfo = { ...state.userInfo, ...action.payload };
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        // Merge the new user data with existing data
        if (state.userInfo && action.payload) {
          state.userInfo = { ...state.userInfo, ...action.payload };
          console.log('Updated user info in Redux state:', state.userInfo);
        } else {
          state.userInfo = action.payload;
        }
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { logout, clearError, resetSuccess } = userSlice.actions;
export default userSlice.reducer; 
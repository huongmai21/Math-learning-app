import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login as loginService,
  refreshUser as refreshUserService,
} from "../../services/authService";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginService(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.errors || error.message);
    }
  }
);

export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshUserService();
      return response.data; // Trả về dữ liệu user
    } catch (error) {
      return rejectWithValue(error.errors || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token"); // Xóa token khi đăng xuất
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // Cập nhật user
        console.log("Updated user in Redux:", action.payload); // Debug
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload.includes("Token")) {
          state.user = null;
          localStorage.removeItem("token");
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

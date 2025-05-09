// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

let userFromStorage = null;
try {
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "undefined") {
    userFromStorage = JSON.parse(storedUser);
  }
} catch (err) {
  userFromStorage = null;
}

const initialState = {
  user: userFromStorage,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};



// Thunk để lấy thông tin user từ token
export const refreshUser = createAsyncThunk("auth/refreshUser", async (_, { rejectWithValue }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return rejectWithValue("No token found");
  }

  try {
    const res = await fetch("http://localhost:3000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Invalid token");
    const data = await res.json();
    return data;
  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return rejectWithValue(err.message);
  }
});

// Thunk để đăng nhập
export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    if (response.ok && result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      return result.user;
    } else {
      throw new Error(result.message || "Đăng nhập thất bại!");
    }
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
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
      });
  },
});

export const {  loginSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
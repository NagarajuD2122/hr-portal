import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export interface AuthUser {
	id: string;
	name: string;
	username: string;
	email: string;
	role: UserRole;
}

interface AuthState {
	accessToken: string | null;
	user: AuthUser | null;
}

const initialState: AuthState = {
	accessToken: null,
	user: null
};

const slice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials(state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) {
			state.accessToken = action.payload.accessToken;
			state.user = action.payload.user;
	   		localStorage.setItem('auth:accessToken', action.payload.accessToken);
            localStorage.setItem('auth:user', JSON.stringify(action.payload.user));
		},
		updateAccessToken(state, action: PayloadAction<string>) {
			state.accessToken = action.payload;
		localStorage.setItem('auth:accessToken', action.payload);
		},
		clearAuth(state) {
			state.accessToken = null;
			state.user = null;
			localStorage.removeItem('auth:accessToken');
            localStorage.removeItem('auth:user');
		}
	}
});

export const { setCredentials, updateAccessToken, clearAuth } = slice.actions;
export default slice.reducer;



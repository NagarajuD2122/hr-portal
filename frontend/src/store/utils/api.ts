import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { clearAuth, updateAccessToken } from '../slices/auth.slice';

const rawBaseQuery = fetchBaseQuery({
	baseUrl: '/api',
	credentials: 'include',
	prepareHeaders: (headers, { getState }) => {
		const token = (getState() as RootState).auth.accessToken;
		if (token) headers.set('authorization', `Bearer ${token}`);
		return headers;
	}
});

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extra) => {
	let result = await rawBaseQuery(args, api, extra);
	if (result.error && (result.error as any).status === 401) {
		// try to refresh
		const refresh = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extra);
		if (refresh.data && (refresh.data as any).accessToken) {
			api.dispatch(updateAccessToken((refresh.data as any).accessToken as string));
			result = await rawBaseQuery(args, api, extra);
		} else {
			api.dispatch(clearAuth());
		}
	}
	return result;
};

export const api = createApi({
	baseQuery: baseQueryWithReauth,
	endpoints: () => ({})
});



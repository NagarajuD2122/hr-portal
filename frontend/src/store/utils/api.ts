import { fetchBaseQuery, createApi, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { clearAuth, updateAccessToken } from '../slices/auth.slice';

// Create the base query
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include', // for sending HttpOnly refresh cookie
 prepareHeaders: (headers, { getState }) => {
  const stateToken = (getState() as RootState).auth.accessToken;
  const storageToken = localStorage.getItem('auth:accessToken');
  // Avoid Bearer null issue
  const token = stateToken || (storageToken && storageToken !== 'null' ? storageToken : undefined);

  if (token) headers.set('authorization', `Bearer ${token}`);

  return headers;
}

});

// Add re-authentication layer
const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);

  // if 401 Unauthorized, try refreshing token
  if ((result.error as FetchBaseQueryError)?.status === 401) {
    try {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extra
      );

      const data = (refreshResult.data || {}) as { accessToken?: string };

      if (data.accessToken) {
        // save new access token
        api.dispatch(updateAccessToken(data.accessToken));
        localStorage.setItem('auth:accessToken', data.accessToken);

        // retry the original request
        result = await rawBaseQuery(args, api, extra);
      } else {
        api.dispatch(clearAuth());
        localStorage.removeItem('auth:accessToken');
      }
    } catch (err) {
      api.dispatch(clearAuth());
      localStorage.removeItem('auth:accessToken');
    }
  }

  return result;
};

// Create the API instance
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});

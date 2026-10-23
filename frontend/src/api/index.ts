import { Api } from './client';
import { mockApi } from './mockApi';
import { httpApi } from './httpApi';

// Defaults to mockApi for instant turnkey zero-dependency client preview,
// and can switch to httpApi to communicate with the live Node/Express backend.
const useHttp = import.meta.env.VITE_USE_HTTP === 'true';

export const api: Api = useHttp ? httpApi : mockApi;
export { mockApi, httpApi };

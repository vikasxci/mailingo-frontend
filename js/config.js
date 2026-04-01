const BACKEND_URL = 'https://mailingo-81ti.onrender.com'; // Change this when deploying to a different server

const CONFIG = {
  backendUrl: BACKEND_URL,
  apiBase: `${BACKEND_URL}/api/mail`,
  endpoints: {
    send: `${BACKEND_URL}/api/mail/send`,
    history: `${BACKEND_URL}/api/mail/history`,
  },
};

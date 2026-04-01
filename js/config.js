const BACKEND_URL = 'https://mailingo-81ti.onrender.com'; // Production
// const BACKEND_URL = 'http://localhost:3000'; // Local dev

const CONFIG = {
  backendUrl: BACKEND_URL,
  endpoints: {
    send:          `${BACKEND_URL}/api/mail/send`,
    history:       `${BACKEND_URL}/api/mail/history`,
    resumeUpload:  `${BACKEND_URL}/api/resume/upload`,
    resumeCurrent: `${BACKEND_URL}/api/resume/current`,
    content:       `${BACKEND_URL}/api/content`,
  },
};

'use server';
export const getDynamicClientEnvironmentVariables = async () => {
  const SOCKET_SERVER_HOST_URL = process.env.SOCKET_SERVER_HOST_URL;
  return {
    SOCKET_SERVER_HOST_URL,
  };
};

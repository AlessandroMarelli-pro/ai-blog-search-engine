export const useAuth = () => {
  // const session = await auth0.getSession();

  const login = () => {
    window.location.href = "/api/auth/login";
  };

  const logout = () => {
    window.location.href = "/api/auth/logout";
  };

  const getToken = async () => {
    try {
      // For Next.js Auth0, tokens are handled server-side
      // We'll need to make API calls to get tokens when needed
      // For now, return null as tokens are managed server-side
      return null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  /*   return {
    isAuthenticated: !!user,
    isLoading,
    user,
    login,
    logout,
    getToken,
    error,
  }; */
  return {
    isAuthenticated: true,
    isLoading: false,
    user: null,
    login,
    logout,
    getToken,
    error: null,
  };
};

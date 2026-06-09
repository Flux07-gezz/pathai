// Save data to localStorage
export const saveToLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  // Get data from localStorage
  export const getFromLocal = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };
  
  // Remove data from localStorage
  export const removeFromLocal = (key) => {
    localStorage.removeItem(key);
  };
  
  // Save user info after login
  export const saveUser = (user, token) => {
    saveToLocal('user', user);
    saveToLocal('token', token);
  };
  
  // Get logged in user
  export const getUser = () => {
    return getFromLocal('user');
  };
  
  // Get token
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Logout - clear everything
  export const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('roadmap');
    localStorage.removeItem('weakTopics');
  };
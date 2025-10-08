export function fakeLogin({ username, password }) {
  if (!username || !password) {
    return { success: false, message: "Please enter both username and password." };
  }
  // Accept only demo credentials for now
  if (username === "testuser" && password === "password123") {
    return { success: true, message: "Login successful!" };
  }
  return { success: false, message: "Invalid credentials." };
}
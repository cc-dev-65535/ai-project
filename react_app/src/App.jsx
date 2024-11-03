import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from "./Home";
import Signup from "./Signup";
import Login from "./Login";
import Logout from "./Logout";
import { AuthContext, getTokenPayload, isLoggedIn } from "./auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient();

export function App() {
  const [authState, setAuthState] = useState({
    status: isLoggedIn(),
    user: getTokenPayload(),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authState}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="signup" element={<Signup />} />
              <Route
                path="login"
                element={<Login setAuthState={setAuthState} />}
              />
              <Route
                path="logout"
                element={<Logout setAuthState={setAuthState} />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

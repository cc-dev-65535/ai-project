import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from "./Home";
import Stories from "./Stories";
import Signup from "./Signup";
import Login from "./Login";
import Logout from "./Logout";
import { AuthContext, loginCheck } from "./auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

export function App() {
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const data = await loginCheck();
      if (!data) {
        return;
      }
      setAuthState({
        status: true,
        user: data,
      });
    };

    checkLogin();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authState}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="stories" element={<Stories />} />
              <Route path="signup" element={<Signup />} />
              <Route
                path="login"
                element={<Login setAuthState={setAuthState} />}
              />
              <Route
                path="logout"
                element={<Logout setAuthState={setAuthState} />}
              />
              <Route path="*" element={<h1>404 - Not Found</h1>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

import { Link, Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <header>
        <h1>My App</h1>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/">Home</Link>
          <Link to="signup">Signup</Link>
          <Link to="login">Login</Link>
        </div>
      </header>
      <Outlet />
    </>
  );
};

export default MainLayout;

import { Link, Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <header>
        <h1>Story Generator App</h1>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/">Home</Link>
          <Link to="signup">Signup</Link>
          <Link to="login">Login</Link>
          <Link to="logout">Logout</Link>
        </div>
      </header>
      <Outlet />
    </>
  );
};

export default MainLayout;

import React, { memo } from "react";
import "./login.css";
import { json, useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = memo(() => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    const value = Object.fromEntries(new FormData(e.target));

    try {
      const res = await axios.post("https://car-spare-part-server.vercel.app/api/login",
        value
      );
      console.log(res.data);

      const token = res.data.token;
      const acsess = res.data.success;
      const role = res.data.role;

      localStorage.setItem("access_token", token);
      localStorage.setItem("acsess", JSON.stringify(acsess));
      localStorage.setItem("role", role);

      window.location.reload();
      navigate("/");
      if (role === "admin") {
        navigate("/admin");
      }
    } catch (error) {
      console.error("API xatosi:", error.response?.data || error.message);
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            placeholder="Login"
            autoComplete="off"
            name="login"
          />
        </label>

        <label>
          <input type="password" placeholder="Password" name="password" />
        </label>

        <label>
          <input type="submit" value="Kirish" />
        </label>
      </form>
    </div>
  );
});

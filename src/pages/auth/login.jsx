import React, { useState, memo } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin } from "antd"; // Импортируем Spin для анимации загрузки

export const Login = memo(() => {
  const [isLoading, setIsLoading] = useState(false); // Состояние для отслеживания загрузки
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Устанавливаем состояние загрузки

    const value = Object.fromEntries(new FormData(e.target));

    try {
      const res = await axios.post("https://car-spare-part-server.vercel.app/api/login", value);
      // const res = await axios.post("http://localhost:8080/api/login", value);
      console.log(res.data);

      const token = res.data.token;
      const acsess = res.data.success;
      const role = res.data.role;

      localStorage.setItem("access_token", token);
      localStorage.setItem("acsess", JSON.stringify(acsess));
      localStorage.setItem("role", role);

      setTimeout(() => {
        setIsLoading(false); // Снимаем состояние загрузки после 2 секунд
        window.location.reload();
        navigate("/");

        if (role === "admin") {
          navigate("/admin");
        }
      }, 2000); // Таймер на 2 секунды
    } catch (error) {
      setIsLoading(false); // Если ошибка, снимаем состояние загрузки
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
          {/* Отображаем кнопку с загрузкой */}
          <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
            {isLoading ? <Spin /> : "Kirish"}
          </button>
        </label>
      </form>
    </div>
  );
});

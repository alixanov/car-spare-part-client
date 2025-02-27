import React, { useState, memo } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin, message } from "antd"; // Добавляем уведомления от Antd

export const Login = memo(() => {
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Включаем индикатор загрузки

    const value = Object.fromEntries(new FormData(e.target));

    try {
      const res = await axios.post(
        "https://car-spare-part-server-i.vercel.app/api/login",
        value,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Включаем cookie (если используется JWT)
        }
      );

      console.log(res.data);

      if (!res.data.success) {
        throw new Error(res.data.message || "Ошибка авторизации!");
      }

      const { token, success, role } = res.data;

      localStorage.setItem("access_token", token);
      localStorage.setItem("acsess", JSON.stringify(success));
      localStorage.setItem("role", role);

      message.success("Успешный вход!"); // Уведомление об успешном входе

      setTimeout(() => {
        setIsLoading(false); // Останавливаем загрузку
        navigate(role === "admin" ? "/admin" : "/");
        window.location.reload();
      }, 1500);
    } catch (error) {
      setIsLoading(false); // Останавливаем загрузку
      console.error("API xatosi:", error.response?.data || error.message);

      // Обрабатываем разные типы ошибок
      if (error.response) {
        message.error(error.response.data.message || "Ошибка сервера!");
      } else if (error.request) {
        message.error("Ошибка сети! Сервер недоступен.");
      } else {
        message.error("Неизвестная ошибка! Попробуйте позже.");
      }
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
            required
          />
        </label>

        <label>
          <input type="password" placeholder="Password" name="password" required />
        </label>

        <label>
          {/* Кнопка с индикатором загрузки */}
          <button type="submit" disabled={isLoading} className={isLoading ? "loading" : ""}>
            {isLoading ? <Spin /> : "Kirish"}
          </button>
        </label>
      </form>
    </div>
  );
});

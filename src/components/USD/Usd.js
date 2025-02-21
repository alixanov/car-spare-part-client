import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button as AntButton, message } from "antd"; // Переименуем Ant Design Button в AntButton
import {
  useGetUsdRateQuery,
  useUpdateUsdRateMutation,
} from "../../context/service/usd.service"; // USD kursi uchun xizmat
import "./usd.css";

import { SaveOutlined } from '@ant-design/icons'; // Иконка для мобильных устройств из Ant Design
import { useMediaQuery } from '@mui/material'; // Хук для проверки ширины экрана

export default function Usd() {
  const { data: usdRateData, isLoading: isUsdRateLoading } =
    useGetUsdRateQuery(); // USD kursini olish
  const [updateUsdRate] = useUpdateUsdRateMutation(); // USD kursini yangilash hook
  const [usdRate, setUsdRate] = useState(usdRateData?.rate || 1); // USD kursi holati

  useEffect(() => {
    if (usdRateData) {
      setUsdRate(usdRateData.rate);
    }
  }, [usdRateData]);

  // USD kursini yangilash
  const handleUsdRateChange = async () => {
    try {
      await updateUsdRate(usdRate).unwrap(); // USD kursini raqamga aylantirish
      message.success("USD kursi muvaffaqiyatli yangilandi!");
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="admin-buttons">
      <Row>
        <Col span={20}>
          <Input
            placeholder="Bugungi USD kursini kiriting"
            value={usdRate}
            onChange={(e) => setUsdRate(e.target.value)}
          />
        </Col>
        <Col span={4}>
          {/* Если мобильное устройство, показываем иконку, иначе текст */}
          {isMobile ? (
            <AntButton
              type="primary"
              shape="circle"
              icon={<SaveOutlined />} // Используем иконку SaveOutlined от Ant Design
              onClick={handleUsdRateChange}
              style={{ marginLeft: 20 }}
            />
          ) : (
            <AntButton
              style={{ marginLeft: 20 }}
              type="primary"
              onClick={handleUsdRateChange}
            >
              Saqlash
            </AntButton>
          )}
        </Col>
      </Row>
    </div>
  );
}

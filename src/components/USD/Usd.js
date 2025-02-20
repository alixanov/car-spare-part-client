import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button, message } from "antd";
import {
  useGetUsdRateQuery,
  useUpdateUsdRateMutation,
} from "../../context/service/usd.service"; // USD kursi uchun xizmat
import "./usd.css"

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
          <Button
            style={{ marginLeft: 20 }}
            type="primary"
            onClick={handleUsdRateChange}
          >
            Saqlash
          </Button>
        </Col>
      </Row>
    </div>
  );
}

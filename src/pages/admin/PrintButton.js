import React from "react";
import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons"; // Иконка для кнопки
import "./print.css"

const PrintButton = () => {
  const printDocument = () => {
    if (window.nativefier) {
      window.nativefier.print();
    } else {
      window.print();
    }
  };

  return (
    <Button type="primary" onClick={printDocument} className="print-button">
      <PrinterOutlined className="print-icon" />
      <span className="print-text">Print Document</span>
    </Button>
  );
};

export default PrintButton;

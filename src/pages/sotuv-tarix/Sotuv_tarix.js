import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  DatePicker,
  Select,
  Statistic,
  Row,
  Col,
  Button,
} from "antd";
import { useGetSalesHistoryQuery } from "../../context/service/sale.service"; // Sale service import qilish

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function SotuvTarix() {
  const { data: sales, isLoading } = useGetSalesHistoryQuery(); // Sotuvlar tarixini olish
  const [filteredSales, setFilteredSales] = useState([]); // Filtrlangan sotuvlar uchun state
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]); // Sana intervali uchun state
  const [paymentMethod, setPaymentMethod] = useState(""); // To'lov usuli uchun state

  // Sana intervali o'zgarganda chaqiriladigan funksiya
  const onDateChange = (dates) => {
    setSelectedDateRange(dates);
    filterSales(dates, paymentMethod);
  };

  // To'lov usuli tanlanganda chaqiriladigan funksiya
  const onPaymentMethodChange = (value) => {
    setPaymentMethod(value);
    filterSales(selectedDateRange, value);
  };

  // Filtrlash funksiyasi
  const filterSales = (dates, payment) => {
    let filtered = sales || [];
    if (dates && dates[0] && dates[1]) {
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= dates[0] && saleDate <= dates[1];
      });
    }
    if (payment) {
      filtered = filtered.filter((sale) => sale.payment_method === payment);
    }
    setFilteredSales(filtered);
  };

  // Umumiy summani hisoblash funksiyasi
  const totalAmount =
    filteredSales?.reduce((acc, sale) => acc + sale.total_price, 0) || 0;

  // Haftalik summani hisoblash funksiyasi
  const weeklyAmount =
    filteredSales
      ?.filter(
        (sale) =>
          new Date(sale.createdAt) >=
          new Date(new Date().setDate(new Date().getDate() - 7))
      )
      .reduce((acc, sale) => acc + sale.total_price, 0) || 0;

  // Kunlik summani hisoblash funksiyasi
  const dailyAmount =
    filteredSales
      ?.filter(
        (sale) =>
          new Date(sale.createdAt).toLocaleDateString() ===
          new Date().toLocaleDateString()
      )
      .reduce((acc, sale) => acc + sale.total_price, 0) || 0;

  // Dastlabki ma'lumotlarni to'ldirish uchun useEffect
  useEffect(() => {
    setFilteredSales(sales || []);
  }, [sales]);

  // Narxni number formatga o'zgartirish funksiyasi
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Bir kunlik savdo tarixini ko'rsatish funksiyasi
  const showDailySales = () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    filterSales([startOfDay, endOfDay], paymentMethod);
  };

  return (
    <Card
      title="Sotuvlar tarixi"
      bordered={false}
      style={{ margin: 20, width: "100%", marginLeft: -1 }}
    >
      <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 10  }}>
        <RangePicker onChange={onDateChange} style={{ marginRight: 20, width: "100%", maxWidth: 300 }} />
        <Select
          placeholder="To'lov usulini tanlang"
          onChange={onPaymentMethodChange}
          style={{ width: "100%", maxWidth: 200 }}
        >
          <Option value="">Barchasi</Option>
          <Option value="naqd">Naqd</Option>
          <Option value="plastik">Karta</Option>
        </Select>
        <Button type="primary" onClick={showDailySales} style={{ width: "100%", maxWidth: 150 }}>
          Bir kunlik savdo
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }} wrap={true}>
        <Col xs={24} sm={8}>
          <Statistic
            title="Umumiy summa"
            value={`${formatNumber(totalAmount)} so'm`}
            style={{ textAlign: "center" }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Haftalik summa"
            value={`${formatNumber(weeklyAmount)} so'm`}
            style={{ textAlign: "center" }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Kunlik summa"
            value={`${formatNumber(dailyAmount)} so'm`}
            style={{ textAlign: "center" }}
          />
        </Col>
      </Row>

      <Table
        dataSource={filteredSales}
        loading={isLoading}
        style={{ width: "100%" }}
        columns={[
          {
            title: "Mahsulot nomi",
            dataIndex: "product_name",
            key: "product_name",
          },
          {
            title: "Narxi",
            dataIndex: "sell_price",
            key: "sell_price",
            render: (text) => `${formatNumber(text)} so'm`,
          },
          { title: "Soni", dataIndex: "quantity", key: "quantity" },
          {
            title: "Umumiy narxi",
            dataIndex: "total_price",
            key: "total_price",
            render: (text) => `${formatNumber(text)} so'm`,
          },
          {
            title: "To'lov usuli",
            dataIndex: "payment_method",
            key: "payment_method",
          },
          {
            title: "Sotilgan sana",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString(),
          },
        ]}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }} // Горизонтальная прокрутка для таблицы
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={5} align="right">
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />

      {/* Responsive Styles */}
      <style jsx>{`
    @media (max-width: 768px) {
      .ant-statistic {
        text-align: center; // Статистика выровнена по центру на планшетах
      }
      .ant-select,
      .ant-picker,
      .ant-btn {
        width: 100% !important; // Поля ввода и кнопка занимают всю ширину на планшетах
      }
    }

    @media (max-width: 480px) {
      .ant-statistic {
        text-align: center; // Статистика выровнена по центру на мобильных
      }
      .ant-select,
      .ant-picker,
      .ant-btn {
        width: 100% !important; // Поля ввода и кнопка занимают всю ширину на мобильных устройствах
      }
      .ant-table {
        font-size: 12px; // Уменьшаем шрифт таблицы для мобильных
      }
      .ant-table td, .ant-table th {
        padding: 8px; // Уменьшаем отступы в таблице на мобильных устройствах
      }
      .ant-col {
        margin-bottom: 10px; // Дополнительный отступ для колонок статистики на мобильных
      }
    }
  `}</style>
    </Card>

  );
}

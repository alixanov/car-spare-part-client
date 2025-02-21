import React, { useState } from "react";
import {
  useCompareStockLevelsQuery,
} from "../../context/service/SalesStatistics.service";
import { useGetSalesStatsQuery } from "../../context/service/sale.service";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import { Select } from "antd";

export default function SalesStatistics() {
  const { data: stats = [] } = useGetSalesStatsQuery();
  const currentMonth = moment().format("YYYY-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: stockComparison, isLoading: stockLoading } =
    useCompareStockLevelsQuery();

  const renderTooltip = (props) => {
    const { payload } = props;
    if (payload && payload.length > 0) {
      const { product_name, sold_quantity } = payload[0].payload;
      return (
        <div style={{ background: "#fff", color: "#000", padding:"20px" }} className="custom-tooltip">
          <p><strong>Mahsulot:</strong> {product_name}</p>
          <p><strong>Sotilgan soni:</strong> {sold_quantity}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: "0 10px" }}>
      {stats.length > 0 && (
        <Select
          defaultValue={selectedMonth}
          onChange={(value) => setSelectedMonth(value)}
          style={{ width: "100%", marginBottom: "20px" }} // Выпадающий список занимает всю ширину
        >
          {stats.map((st) => (
            <Select.Option key={st.date} value={st.date}>
              {st.date}
            </Select.Option>
          ))}
        </Select>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stats.find(st => st.date === selectedMonth)?.products || []}>
          <XAxis dataKey="product_name" />
          <YAxis />
          <Tooltip content={renderTooltip} />
          <Bar dataKey="sold_quantity" fill="#1890ff" />
        </BarChart>
      </ResponsiveContainer>

      {/* Responsive Styles */}
      <style jsx>{`
    @media (max-width: 768px) {
      .ant-select {
        width: 100%; // Выпадающий список занимает всю ширину на планшетах
      }
    }

    @media (max-width: 480px) {
      .ant-select {
        width: 100%; // Выпадающий список на мобильных тоже занимает всю ширину
      }
      .ant-select-selection-item {
        font-size: 14px; // Уменьшение шрифта для мобильных устройств
      }
    }
  `}</style>
    </div>

  );
}

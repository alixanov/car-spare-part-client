import React, { useEffect, useState } from "react";
import { useGetBudgetQuery } from "../../context/service/budget.service";
import "./xisobot.css";
import { useGetAllProductsQuery } from "../../context/service/addproduct.service";
import { useGetDebtorsQuery } from "../../context/service/debtor.service";
import { useGetStoreProductsQuery } from "../../context/service/store.service";
import { useGetExpensesQuery } from "../../context/service/harajatlar.service";
import { useGetSalesHistoryQuery } from "../../context/service/sale.service";
import { useGetUsdRateQuery } from "../../context/service/usd.service";
import { DatePicker } from "antd";

export default function Xisobot() {
  const { data: budgetData } = useGetBudgetQuery();
  const { data: saleData } = useGetSalesHistoryQuery();
  const { data: skladData } = useGetAllProductsQuery();
  const { data: storeData } = useGetStoreProductsQuery();
  const { data: debtData } = useGetDebtorsQuery();
  const { data: harajatData } = useGetExpensesQuery();
  const { data: usdRate } = useGetUsdRateQuery();
  const [selectedDate, setSelectedDate] = useState(null); // Изменено на одну дату
  const [umumiyDebt, setUmumiyDebt] = useState(0);
  const [umumiySale, setUmumiySale] = useState(0);
  const [umumiySklad, setUmumiySklad] = useState(0);
  const [umumiyStore, setUmumiyStore] = useState(0);
  const [umumiyHarajat, setUmumiyHarajat] = useState(0);
  const [umumiyAstatka, setUmumiyAstatka] = useState(0);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const startDate = selectedDate ? selectedDate.startOf("day") : null;

    setUmumiyDebt(
      debtData?.filter(
        (item) =>
          startDate ? new Date(item.createdAt) >= startDate : true
      )?.reduce((a, b) => a + (b?.debt_amount || 0), 0)
    );

    setUmumiySklad(
      skladData?.reduce(
        (a, b) =>
          a +
          (b?.stock || 0) * ((b?.sell_price || 0) - (b?.purchase_price || 0)),
        0
      ) || 0
    );

    setUmumiyStore(
      storeData?.reduce(
        (a, b) =>
          a +
          (b?.quantity || 0) *
          ((b?.product_id?.sell_price || 0) - (b?.product_id?.purchase_price || 0)),
        0
      ) || 0
    );

    setUmumiySale(
      saleData?.filter(
        (item) =>
          startDate ? new Date(item.createdAt) >= startDate : true
      )?.reduce(
        (a, b) =>
          a +
          (b?.quantity || 0) *
          ((b?.sell_price || 0) - (b?.buy_price || 0) * (usdRate?.rate || 0)),
        0
      ) || 0
    );

    setUmumiyHarajat(
      harajatData?.filter(
        (item) =>
          startDate ? new Date(item.createdAt) >= startDate : true
      )?.reduce((a, b) => a + (b?.payment_summ || 0), 0) || 0
    );

    setUmumiyAstatka(
      (skladData?.reduce(
        (a, b) => a + (b?.stock || 0) * (b?.purchase_price || 0),
        0
      ) || 0) +
      (storeData?.reduce(
        (a, b) =>
          a + (b?.quantity || 0) * (b?.product_id?.purchase_price || 0),
        0
      ) || 0)
    );
  }, [debtData, saleData, skladData, storeData, harajatData, selectedDate, usdRate]);

  return (
    <div style={{ height: "calc(100vh - 200px)", paddingInline: "12px" }}>
      <div style={{ marginBottom: "20px" }}>
        <DatePicker
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          style={{ width: "100%", maxWidth: "330px" }} // Уменьшаем ширину календаря
          placeholder="Выберите дату"
        />
      </div>

      <div className="hisobot_container">
        <div className="hisobot_card">
          <p>Umumiy sotuv daromadi</p>
          <b>{umumiySale?.toLocaleString()} UZS</b>
        </div>
        <div className="hisobot_card">
          <p>Umumiy qarzdorlik</p>
          <b>{umumiyDebt?.toLocaleString()} UZS</b>
        </div>
        <div className="hisobot_card">
          <p>Umumiy harajat</p>
          <b>{umumiyHarajat?.toLocaleString()} UZS</b>
        </div>
        <div className="hisobot_card">
          <p>Sklad va Do'kon - umumiy astatka</p>
          <b>{umumiyAstatka?.toLocaleString()}$</b>
        </div>
      </div>
    </div>
  );
}
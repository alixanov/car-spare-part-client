import React, { useState } from "react";
import { Table, Button, Input, message, Modal } from "antd";
import {
  useGetDebtorsQuery,
  useReturnProductDebtorMutation,
  useUpdateDebtorMutation,
} from "../../context/service/debtor.service";
import moment from "moment/moment";
import { render } from "@testing-library/react";
import { useGetAllProductsQuery } from "../../context/service/addproduct.service";

export default function Qarzdor() {
  const { data: debtors, isLoading, refetch } = useGetDebtorsQuery(); // Barcha qarzdorlarni olish
  const {data:products} = useGetAllProductsQuery(); // Barcha mahsulotlarni olish
  const [updateDebtor] = useUpdateDebtorMutation(); // Qarzdorni yangilash uchun hook
  const [returnDebtor] = useReturnProductDebtorMutation(); // Qarzdorni yangilash uchun hook
  const [paymentAmounts, setPaymentAmounts] = useState({}); // Har bir qarzdor uchun kiritilgan summa
  const [listModal, setListModal] = useState(false);
  const [listId, setListId] = useState("");
  const [returnQuantity, setReturnQuantity] = useState({}); // Har bir qarzdor uchun qaytarilayotgan soni

  // To'lov summasini o'zgartirish funksiyasi
  const handleInputChange = (id, value) => {
    setPaymentAmounts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Qarz to'lash funksiyasi
  const handlePayDebt = async (debtor) => {
    const paidAmount = paymentAmounts[debtor._id]; // To'langan summani olish
    const trimmedAmount = Number(paidAmount?.trim());

    if (!trimmedAmount || isNaN(trimmedAmount) || trimmedAmount <= 0) {
      message.error("Iltimos, to'langan summani to'g'ri kiriting");
      return;
    }

    if (trimmedAmount > debtor.debt_amount) {
      message.error(
        `To'langan summa qarz miqdoridan (${debtor.debt_amount}) oshmasligi kerak`
      );
      return;
    }

    try {
      await updateDebtor({
        id: debtor._id,
        paid_amount: trimmedAmount, // Son formatida yuborish
      }).unwrap();

      message.success("Qarz muvaffaqiyatli to'landi");
      setPaymentAmounts((prev) => ({ ...prev, [debtor._id]: "" })); // Inputni tozalash
      refetch(); // Qarzlar ro'yxatini yangilash
    } catch (error) {
      message.error(error?.data?.message || "Qarz to'lashda xatolik yuz berdi");
    }
  };

  // Tovarni qaytarish funksiyasi
  const handleReturnProduct = async (debtor) => {
    const quantity = returnQuantity[debtor._id]; // Qaytarilayotgan soni olish
    const trimmedQuantity = Number(quantity?.trim());

    if (!trimmedQuantity || isNaN(trimmedQuantity) || trimmedQuantity <= 0) {
      message.error("Iltimos, qaytarilayotgan sonini to'g'ri kiriting");
      return;
    }

    if (trimmedQuantity > debtor.product_quantity) {
      message.error(
        `Qaytarilayotgan soni mahsulot sonidan (${debtor.product_quantity}) oshmasligi kerak`
      );
      return;
    }

    try {
      await returnDebtor({
        id: debtor._id,
        quantity: trimmedQuantity, // Son formatida yuborish
      }).unwrap();

      message.success("Mahsulot muvaffaqiyatli qaytarildi");
      setReturnQuantity((prev) => ({ ...prev, [debtor._id]: "" })); // Inputni tozalash
      refetch(); // Qarzlar ro'yxatini yangilash
    } catch (error) {
      message.error(
        error?.data?.message || "Mahsulotni qaytarishda xatolik yuz berdi"
      );
    }
  };

  // Table ustunlari
  const columns = [
    { title: "Ism", dataIndex: "name", key: "name", width: 100 },
    { title: "Telefon", dataIndex: "phone", key: "phone", width: 100 },
    {
      title: "Mahsulot",
      dataIndex: "product_name",
      key: "product_name",
      width: 100,
    },
    {
      title: "Model",
      render: (_, record)=>products.find(pr=>pr._id === record.product_id)?.model,
      key: "model",
      width: 100,
    },
    {
      title: "Soni",
      dataIndex: "product_quantity",
      key: "product_quantity",
      width: 100,
    },
    {
      title: "Qarz miqdori",
      dataIndex: "debt_amount",
      key: "debt_amount",
      width: 100,
    },
    {
      title: "Qarz muddati",
      dataIndex: "due_date",
      key: "due_date",
      width: 100,
      render: (text) => moment(text).format("YYYY-MM-DD "), // To'g'ri formatda chiqarish
    },
    {
      title: "To'lov",
      key: "payment",
      width: 150,
      render: (_, record) => (
        <Input
          placeholder="To'langan summa"
          value={paymentAmounts[record._id] || ""}
          onChange={(e) => handleInputChange(record._id, e.target.value)}
          type="number"
          min="0"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: "Harakatlar",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            type="primary"
            size="small"
            onClick={() => handlePayDebt(record)}
          >
            To'lash
          </Button>
          {record.payment_log.length > 0 && (
            <Button
              size="small"
              style={{ marginTop: "6px" }} // Margin left o'rniga margin top ishlatiladi
              type="primary"
              onClick={() => {
                setListId(record._id);
                setListModal(true);
              }}
            >
              Tarix
            </Button>
          )}
          <Input
            placeholder="Qaytarilayotgan soni"
            value={returnQuantity[record._id] || ""}
            onChange={(e) =>
              setReturnQuantity((prev) => ({
                ...prev,
                [record._id]: e.target.value,
              }))
            }
            type="number"
            min="0"
            max={record.product_quantity}
            style={{ width: 100, marginTop: "6px" }}
          />
          <Button
            type="primary"
            size="small"
            danger
            style={{ marginTop: "6px" }}
            onClick={() => handleReturnProduct(record)}
          >
            Qaytarish
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Modal
        open={listModal}
        title="To'lovlar ro'yxati"
        footer={[]}
        onCancel={() => {
          setListModal(false);
          setListId("");
        }}
        width={400} // Modal oynasining kengligini o'rnatish
      >
        <table className="table">
          <thead>
            <tr>
              <td>No</td>
              <td>Sana</td>
              <td>Summa</td>
            </tr>
          </thead>
          <tbody>
            {debtors
              ?.find((d) => d?._id === listId)
              ?.payment_log?.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{moment(item?.date)?.format("DD.MM.YYYY HH:mm:ss")}</td>
                  <td>{item?.amount?.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Modal>
      <Table
        dataSource={debtors}
        loading={isLoading}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        size="small" // Stol kattaligini kichiklashtirish
        style={{ fontSize: "12px" }} // Matn kattaligini kichiklashtirish
      />
    </div>
  );
}

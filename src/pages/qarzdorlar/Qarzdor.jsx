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
        style={{ maxWidth: "90%", margin: "0 auto" }} // Ограничение ширины модального окна для больших экранов
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

        {/* Responsive Styles */}
        <style jsx>{`
    @media (max-width: 768px) {
      .ant-modal {
        width: 90% !important; // Увеличиваем ширину модального окна на планшетах
      }
      .table td {
        font-size: 14px; // Уменьшаем шрифт таблицы для планшетов
        padding: 10px;
      }
    }

    @media (max-width: 480px) {
      .ant-modal {
        width: 100% !important; // Модальное окно занимает всю ширину экрана на мобильных
      }
      .table td {
        font-size: 12px; // Еще больше уменьшаем шрифт для мобильных устройств
        padding: 8px;
      }
    }
  `}</style>
      </Modal>

      <Table
        dataSource={debtors}
        loading={isLoading}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        size="small" // Уменьшаем размер таблицы
        style={{ fontSize: "12px", width: "100%" }} // Уменьшаем шрифт и делаем таблицу адаптивной по ширине
      />

      {/* Responsive Styles */}
      <style jsx>{`
  @media (max-width: 768px) {
    .ant-table {
      font-size: 10px; // Уменьшаем шрифт таблицы для планшетов
    }
    .ant-table td {
      padding: 8px; // Уменьшаем отступы в ячейках таблицы для планшетов
    }
  }

  @media (max-width: 480px) {
    .ant-table {
      font-size: 8px; // Еще больше уменьшаем шрифт таблицы для мобильных устройств
    }
    .ant-table td {
      padding: 6px; // Уменьшаем отступы в ячейках таблицы для мобильных устройств
    }
  }
`}</style>

    </div>
  );
}

// bitdi
import React, { useState, useEffect } from "react";
import { Button, Form, Input, Modal, Table, message } from "antd";
import {
  useGetExpensesQuery,
  useAddExpenseMutation,
} from "../../context/service/harajatlar.service";
import {
  useGetBudgetQuery,
  useUpdateBudgetMutation,
} from "../../context/service/budget.service";

export default function Xarajatlar() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const { data: budgetData, isLoading: budgetLoading } = useGetBudgetQuery();
  const [updateBudget] = useUpdateBudgetMutation();
  const {
    data: expensesData,
    error: getError,
    isLoading: isGetLoading,
  } = useGetExpensesQuery();
  const [addExpense, { isLoading: isAddLoading }] = useAddExpenseMutation();

  useEffect(() => {
    if (expensesData) {
      setExpenses(expensesData);
    }
  }, [expensesData]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      const response = await addExpense(values).unwrap();
      await updateBudget(Number(values.payment_summ)).unwrap();
      setExpenses([...expenses, { ...values, key: expenses.length }]);
      form.resetFields();
      message.success(response.message);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Xatolik:", error);
      message.error("Xarajatni qo'shishda xatolik yuz berdi.");
    }
  };

  const columns = [
    {
      title: "Xarajat summasi",
      dataIndex: "payment_summ",
      key: "payment_summ",
    },
    {
      title: "Xarajat sababi",
      dataIndex: "comment",
      key: "comment",
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={showModal}
        style={{ marginBottom: "10px", width: "100%" }} // Ширина кнопки 100% для адаптации
      >
        Xarajat Qo'shish
      </Button>

      <Modal
        title="Xarajat Qo'shish"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        style={{ marginTop: "50px", maxWidth: "90%", margin: "0 auto" }} // Ограничение ширины модального окна
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Xarajat summasi"
            name="payment_summ"
            rules={[{ required: true, message: "Xarajat summasini kiriting!" }]}
          >
            <Input type="number" placeholder="Xarajat summasi" />
          </Form.Item>
          <Form.Item
            label="Xarajat sababi"
            name="comment"
            rules={[{ required: true, message: "Xarajat sababini kiriting!" }]}
          >
            <Input.TextArea placeholder="Xarajat sababi" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isAddLoading}
            >
              Qo'shish
            </Button>
          </Form.Item>
        </Form>

        {/* Responsive Styles */}
        <style jsx>{`
    @media (max-width: 768px) {
      .ant-modal {
        width: 90% !important; // Модальное окно занимает 90% ширины экрана на планшетах
      }
      .ant-form-item {
        font-size: 14px; // Уменьшаем шрифт формы на планшетах
      }
    }

    @media (max-width: 480px) {
      .ant-modal {
        width: 100% !important; // Модальное окно на мобильных устройствах занимает всю ширину
      }
      .ant-form-item {
        font-size: 12px; // Уменьшаем шрифт формы на мобильных
      }
      .ant-input {
        font-size: 12px; // Уменьшаем шрифт для полей ввода на мобильных
      }
      .ant-btn {
        font-size: 14px; // Уменьшаем размер кнопки на мобильных
      }
    }
  `}</style>
      </Modal>

      <Table
        dataSource={expenses}
        columns={columns}
        loading={isGetLoading}
        pagination={{ pageSize: 5 }} // На каждой странице отображается 5 записей
        style={{ width: "100%", fontSize: "14px" }} // Устанавливаем базовый стиль и ширину
      />

      {/* Responsive Styles */}
      <style jsx>{`
  @media (max-width: 768px) {
    .ant-table {
      font-size: 12px; // Уменьшаем шрифт для планшетов
    }
    .ant-table td {
      padding: 8px; // Уменьшаем отступы в ячейках на планшетах
    }
  }

  @media (max-width: 480px) {
    .ant-table {
      font-size: 10px; // Еще больше уменьшаем шрифт для мобильных устройств
    }
    .ant-table td {
      padding: 6px; // Уменьшаем отступы в ячейках для мобильных устройств
    }
    .ant-pagination {
      font-size: 12px; // Уменьшаем шрифт пагинации на мобильных устройствах
    }
    .ant-pagination-item {
      padding: 6px; // Уменьшаем отступы у элементов пагинации
    }
  }
`}</style>



    </div>
  );
}

// bitdi
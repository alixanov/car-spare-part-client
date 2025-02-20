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
        style={{ marginBottom: "10px" }}
      >
        Xarajat Qo'shish
      </Button>

      <Modal
        title="Xarajat Qo'shish"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        style={{ marginTop: "50px" }}
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
      </Modal>

      <Table
        dataSource={expenses}
        columns={columns}
        loading={isGetLoading}
        pagination={{ pageSize: 5 }} // Har bir sahifada 5 ta yozuv
      />

  
    </div>
  );
}

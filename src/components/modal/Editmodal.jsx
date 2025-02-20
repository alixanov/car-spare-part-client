import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Input, Row, Col, message, Select } from "antd";
import { useUpdateProductMutation } from "../../context/service/addproduct.service";

const EditProductModal = ({ visible, onCancel, product, usdRate, isStore }) => {
  const [editForm] = Form.useForm(); // Tahrirlash formasi hook
  const [updateProduct] = useUpdateProductMutation(); // Mahsulotni yangilash uchun API chaqiruv hook
  const [editingProduct, setEditingProduct] = useState(product); // Hozir tahrirlanayotgan mahsulot

  useEffect(() => {
    if (product) {
      setEditingProduct(product);
      editForm.setFieldsValue({
        ...product,
        purchase_price: product.purchase_price,
        sell_price: product.sell_price,
      });
    }
  }, [product, usdRate, editForm]);

  // Mahsulotni tahrirlash
  const handleEditFinish = async (values) => {
    try {
      if (isStore) {
        delete values.stock
      }
      const purchasePriceSom = values.purchase_price;
      const sellPriceSom = values.sell_price;
      await updateProduct({
        id: editingProduct._id,
        ...values,
        purchase_price: purchasePriceSom,
        sell_price: sellPriceSom,
      }).unwrap();
      message.success("Mahsulot muvaffaqiyatli tahrirlandi!");
      onCancel(); // Modal oynasini yopish
      editForm.resetFields();
    } catch (error) {
      message.error("Xato yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  return (
    <Modal
      title="Mahsulotni tahrirlash"
      visible={visible}
      onCancel={() => {
        onCancel();
        editForm.resetFields();
      }}
      footer={null}
    >
      <Form layout="vertical" form={editForm} onFinish={handleEditFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mahsulot nomi"
              name="product_name"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input placeholder="Mahsulot nomi" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Modeli"
              name="model"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input placeholder="Modeli" autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          {
            !isStore && (
              <Col span={12}>
                <Form.Item
                  label="Miqdor"
                  name="stock"
                  rules={[{ required: true, message: "Majburiy maydon!" }]}
                >
                  <Input type="number" placeholder="Miqdor" autoComplete="off" />
                </Form.Item>
              </Col>
            )
          }
          <Col span={12}>
            <Form.Item
              label="Katalogi"
              name="product_category"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input placeholder="Katalogi" autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Sotib olish narxi (USD)"
              name="purchase_price"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input
                type="number"
                placeholder="Sotib olish narxi (USD)"
                autoComplete="off"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Sotish narxi (USD)"
              name="sell_price"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input
                type="number"
                placeholder="Sotish narxi (USD)"
                autoComplete="off"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              label="Kimdan kelgan"
              name="kimdan_kelgan"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input placeholder="Kimdan kelgan" autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Brend nomi"
              name="brand_name"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input placeholder="Brend nomi" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="O'lchov birligi"
              name="count_type"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Select placeholder="O'lchov birligi" autoComplete="off">
                <Select.Option value="dona">Dona</Select.Option>
                <Select.Option value="komplekt">Komplekt</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Qadoq turi"
              name="packing_type"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input placeholder="Qadoq turi" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Shtrix kod"
              name="barcode"
              rules={[{ required: true, message: "Majburiy maydon!" }]}
            >
              <Input placeholder="Shtrix kod" autoComplete="off" disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Maxsus eslatmalar" name="special_notes">
              <Input.TextArea
                placeholder="Maxsus eslatmalar"
                autoComplete="off"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Saqlash
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProductModal;

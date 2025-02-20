import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  message,
  Select,
  AutoComplete,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  useCreateProductMutation,
  useGetAllProductsQuery,
} from "../../context/service/addproduct.service";
import {
  useAddProductToStoreMutation,
  useCreateProductToStoreMutation,
} from "../../context/service/store.service";

const { Option } = Select;

const AddProductToStore = ({ refetchProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [createProduct] = useCreateProductToStoreMutation();
  const { data: allProducts } = useGetAllProductsQuery();
  const [barcode, setBarcode] = useState("");
  const [addProductToStore] = useAddProductToStoreMutation();
  const [productNames, setProductNames] = useState([]);
  const [models, setModels] = useState([]);
  const [brandNames, setBrandNames] = useState([]);
  const [kimdan_kelgan, setKimdanKelgan] = useState([]);
  const [packingTypes, setPackingTypes] = useState([]);

  useEffect(() => {
    if (isModalOpen) {
      const generateBarcode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setBarcode(code);
      };
      generateBarcode();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (allProducts) {
      const uniqueProductNames = [
        ...new Set(allProducts.map((product) => product.product_name)),
      ];
      setProductNames(uniqueProductNames.sort());

      const uniqueModels = [
        ...new Set(allProducts.map((product) => product.model)),
      ];
      setModels(uniqueModels);

      const uniqueBrandNames = [
        ...new Set(allProducts.map((product) => product.brand_name)),
      ];
      setBrandNames(uniqueBrandNames);

      const uniquePackingTypes = [
        ...new Set(allProducts.map((product) => product.packing_type)),
      ];
      setPackingTypes(uniquePackingTypes);

      const uniqueKimdanKelgan = [
        ...new Set(allProducts.map((product) => product.kimdan_kelgan)),
      ];
      setKimdanKelgan(uniqueKimdanKelgan);
    }
  }, [allProducts]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      const productData = {
        ...values,
        barcode,
      };

      const createdProduct = await createProduct(productData).unwrap();

      message.success("Mahsulot muvaffaqiyatli qo'shildi!");
      setIsModalOpen(false);
      form.resetFields();
      refetchProducts();
    } catch (error) {
      message.error("Xato yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={showModal}
        style={{
          backgroundColor: "#52c41a",
          borderColor: "#52c41a",
          marginBottom: "10px",
        }}
        icon={<PlusOutlined />}
      >
        Dokonga Mahsulot qo'shish +
      </Button>

      <Modal
        title="Mahsulot yaratish va dokonga qo'shish"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mahsulot nomi"
                name="product_name"
                rules={[{ required: true, message: "Majburiy maydon!" }]}
              >
                <AutoComplete
                  options={productNames.map((name) => ({
                    value: name,
                  }))}
                  placeholder="Mahsulot nomi"
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="Mahsulot nomi" autoComplete="off" />
                </AutoComplete>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Model"
                name="model"
                rules={[{ required: true, message: "Majburiy maydon!" }]}
              >
                <AutoComplete
                  options={models.map((model) => ({
                    value: model,
                  }))}
                  placeholder="Model"
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="Model" autoComplete="off" />
                </AutoComplete>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Miqdor"
                name="stock"
                rules={[{ required: true, message: "Majburiy maydon!" }]}
              >
                <Input type="number" placeholder="Miqdor" autoComplete="off" />
              </Form.Item>
            </Col>
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Brend nomi" name="brand_name">
                <AutoComplete
                  options={brandNames.map((brand) => ({
                    value: brand,
                  }))}
                  placeholder="Brend nomi"
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="Brend nomi" autoComplete="off" />
                </AutoComplete>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="O'lchov birligi"
                name="count_type"
                rules={[{ required: true, message: "Majburiy maydon!" }]}
              >
                <Select placeholder="O'lchov birligi" autoComplete="off">
                  <Option value="dona">Dona</Option>
                  <Option value="komplekt">Komplekt</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Qadoq turi" name="packing_type">
                <AutoComplete
                  options={packingTypes.map((type) => ({
                    value: type,
                  }))}
                  placeholder="Qadoq turi"
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="Qadoq turi" autoComplete="off" />
                </AutoComplete>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Shtrix kod"
                name="barcode"
                initialValue={barcode}
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Kimdan kelgan"
                name="kimdan_kelgan"
                rules={[{ required: true, message: "Majburiy maydon!" }]}
              >
                <AutoComplete
                  options={kimdan_kelgan.map((kimdan) => ({
                    value: kimdan,
                  }))}
                  placeholder="Kimdan kelgan"
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) !== -1
                  }
                >
                  <Input placeholder="Kimdan kelgan" autoComplete="off" />
                </AutoComplete>
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
    </div>
  );
};

export default AddProductToStore;

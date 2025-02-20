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
  Tabs,
  Table,
  AutoComplete,
} from "antd";
import { Popconfirm } from "antd";
import "antd/dist/reset.css";
import { Option } from "antd/es/mentions";
import "./admin.css";
import {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "../../context/service/addproduct.service";
import {
  PlusOutlined,
  UserAddOutlined,
  MoneyCollectOutlined,
  BarChartOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import Adminlar from "../Adminlar/Adminlar";
import Sotuv_tarix from "../sotuv-tarix/Sotuv_tarix";
import Qarzdor from "../qarzdorlar/Qarzdor";
import StoreItem from "../Store/StoreItem";
import Xisobot from "../Xisobod/Xisobot";
import EditProductModal from "../../components/modal/Editmodal"; // Tahrirlash modal komponenti
import {
  useGetUsdRateQuery,
  useUpdateUsdRateMutation,
} from "../../context/service/usd.service"; // USD kursi uchun xizmat
import PrintBarcodeModal from "../../components/print/PrintBarcodeModal"; // Barcode modal komponenti
import { useAddProductToStoreMutation } from "../../context/service/store.service";
import PrintButton from "./PrintButton"; // PrintButton komponentini import qiling
import SalesStatistics from "../SalesStatistics/SalesStatistics";
import { FaPrint } from "react-icons/fa";
import { BiTransfer } from "react-icons/bi";

export const Admin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal oynasi holatini boshqarish
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Tahrirlash modal oynasi holatini boshqarish
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // Barcode chop etish modal oynasi holatini boshqarish
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false); // Dokonga o'tkazish modal oynasi holatini boshqarish
  const [selectedProduct, setSelectedProduct] = useState(null); // Tanlangan mahsulot
  const [form] = Form.useForm(); // Ant Design Form hook
  const [createProduct] = useCreateProductMutation(); // Mahsulot yaratish uchun API chaqiruv hook
  const { data, error, isLoading, refetch } = useGetAllProductsQuery(); // Barcha mahsulotlarni olish uchun API chaqiruv hook
  const [barcode, setBarcode] = useState(""); // Shtrix kod holati
  const [deleteProduct] = useDeleteProductMutation(); // Mahsulotni o'chirish uchun API chaqiruv hook
  const [updateProduct] = useUpdateProductMutation(); // Mahsulotni yangilash uchun API chaqiruv hook
  const [addProductToStore] = useAddProductToStoreMutation(); // Dokonga mahsulot qo'shish uchun API chaqiruv hook
  const access = JSON.parse(localStorage.getItem("acsess")); // Foydalanuvchi huquqlarini olish
  const [editingProduct, setEditingProduct] = useState(null); // Hozir tahrirlanayotgan mahsulot
  const [totalProfit, setTotalProfit] = useState(0); // Umumiy foyda holati
  const { data: usdRateData } = useGetUsdRateQuery(); // USD kursini olish
  const [updateUsdRate] = useUpdateUsdRateMutation(); // USD kursini yangilash hook
  const [usdRate, setUsdRate] = useState(usdRateData?.rate || 1); // USD kursi holati

  const [productNames, setProductNames] = useState([]); // Mahsulot nomlari
  const [brandNames, setBrandNames] = useState([]); // Brend nomlari
  const [kimdan_kelgan, setkimdan_kelgan] = useState([]); // kimdan kelgan
  const [models, setModels] = useState([]); // Modellar
  const [packingTypes, setPackingTypes] = useState([]); // Qadoq turlari
  const [searchText, setSearchText] = useState(""); // Qidiruv matni
  const [stockFilter, setStockFilter] = useState("all"); // Filter holati

  useEffect(() => {
    if (usdRateData) {
      setUsdRate(usdRateData.rate);
    }
  }, [usdRateData]);

  // Mahsulotlar ma'lumotlarini o'zgartirganda umumiy foyda hisoblash

  useEffect(() => {
    if (data) {
      const profit = data.reduce((acc, product) => {
        const productProfit =
          (product.sell_price - product.purchase_price) * product.stock;
        return acc + productProfit;
      }, 0);
      setTotalProfit(profit);

      // Mahsulot nomlarini olish
      const uniqueProductNames = [
        ...new Set(data.map((product) => product.product_name)),
      ];
      setProductNames(uniqueProductNames.sort());

      // Brend nomlarini olish
      const uniqueBrandNames = [
        ...new Set(data.map((product) => product.brand_name)),
      ];
      setBrandNames(uniqueBrandNames);

      // Modellarni olish
      const uniqueModels = [...new Set(data.map((product) => product.model))];
      setModels(uniqueModels);

      // Qadoq turlarini olish
      const uniquePackingTypes = [
        ...new Set(data.map((product) => product.packing_type)),
      ];
      // kimdan_kelgan
      const uniquekimdan_kelgan = [
        ...new Set(data.map((product) => product.kimdan_kelgan)),
      ];
      setkimdan_kelgan(uniquekimdan_kelgan);

      setPackingTypes(uniquePackingTypes);
    }
  }, [data]);

  // Modal oynasi ochilganda shtrix kod yaratish
  useEffect(() => {
    if (isModalOpen) {
      const generateBarcode = () => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setBarcode(code);
      };
      generateBarcode();
    }
  }, [isModalOpen]);

  // USD kursini yangilash
  const handleUsdRateChange = async () => {
    try {
      await updateUsdRate(usdRate).unwrap(); // USD kursini raqamga aylantirish
      message.success("USD kursi muvaffaqiyatli yangilandi!");
      refetch(); // Mahsulotlar ro'yxatini yangilash
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  // USD kursi o'zgarganda mahsulotlar ro'yxatini yangilash
  useEffect(() => {
    refetch(); // Mahsulotlar ro'yxatini yangilash
  }, [usdRate]);

  // Modal oynasini ko'rsatish
  const showModal = () => {
    setIsModalOpen(true);
  };

  // Modal oynasini yopish
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Yangi mahsulot qo'shish
  const handleFinish = async (values) => {
    try {
      const productData = {
        ...values,
        barcode,
      };

      await createProduct(productData).unwrap();
      message.success("Mahsulot muvaffaqiyatli qo'shildi!");

      setIsModalOpen(false);
      form.resetFields();
      refetch();
      window.location.reload();
    } catch (error) {
      message.error("Xato yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  // Shtrix kodni chop qilish modalini ko'rsatish
  const showPrintModal = (barcode) => {
    setBarcode(barcode);
    setIsPrintModalOpen(true);
  };

  // Shtrix kodni chop qilish modalini yopish
  // Shtrix kodni chop qilish modalini yopish
  const handlePrintModalClose = () => {
    setIsPrintModalOpen(false);
  };

  // Mahsulotni tahrirlash modal oynasini ko'rsatish
  const showEditModal = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Tahrirlash modal oynasini yopish
  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    refetch(); // Mahsulotlar ro'yxatini yangilash
  };

  // Dokonga o'tkazish modal oynasini ko'rsatish
  const showTransferModal = (product) => {
    setSelectedProduct(product);
    setIsTransferModalOpen(true);
  };

  // Dokonga o'tkazish modal oynasini yopish
  const handleTransferCancel = () => {
    setIsTransferModalOpen(false);
    setSelectedProduct(null);
    form.resetFields();
  };

  // Dokonga mahsulot qo'shish
  const handleAddToStore = async (values) => {
    try {
      await addProductToStore({
        product_id: selectedProduct._id,
        quantity: values.quantity,
      }).unwrap();
      message.success("Mahsulot do'konga muvaffaqiyatli o'tkazildi!");
      setIsTransferModalOpen(false);
      setSelectedProduct(null);
      refetch(); // Mahsulotlar ro'yxatini yangilash
    } catch (error) {
      message.error("Mahsulotni do'konga o'tkazishda xatolik yuz berdi");
    }
  };

  // Mahsulotlar jadvali ustunlari
  const columns = [
    { title: "Mahsulot nomi", dataIndex: "product_name", key: "product_name" },
    { title: "Modeli", dataIndex: "model", key: "model" },
    {
      title: "Miqdor",
      dataIndex: "stock",
      key: "stock",
      render: (text) => (
        <div
          style={{
            backgroundColor:
              text === 0 ? "red" : text <= 5 ? "yellow" : "inherit",
            padding: "8px",
            textAlign: "center",
          }}
        >
          {Number(text).toLocaleString()}
        </div>
      ),
    },
    {
      title: "Katalogi",
      dataIndex: "product_category",
      key: "product_category",
    },
    {
      title: "Olish Narxi (USD)",
      dataIndex: "purchase_price",
      key: "purchase_price",
      render: (text) => `${text.toFixed(2)} USD`, // Narxni USD da ko'rsatish
    },
    {
      title: "Sotish Narxi (USD)",
      dataIndex: "sell_price",
      key: "sell_price",
      render: (text) => `${text.toFixed(2)} USD`, // Narxni USD da ko'rsatish
    },
    { title: "Brend nomi", dataIndex: "brand_name", key: "brand_name" },
    { title: "O'lchov birligi", dataIndex: "count_type", key: "count_type" },
    {
      title: "Shtrix kod",
      dataIndex: "barcode",
      key: "barcode",
      render: (barcode) => (
        <div>
          <Button
            onClick={() => showPrintModal(barcode)}
            type="primary"
            style={{ marginRight: "10px" }}
          >
            <FaPrint />
          </Button>
        </div>
      ),
    },
    {
      title: "kimdan_kelgan",
      dataIndex: "kimdan_kelgan",
      key: "kimdan_kelgan",
    },
    {
      title: "Umumiy Narxi (USD)",
      key: "total_price",
      render: (_, record) => {
        const totalPrice = record.sell_price * record.stock;
        return `${totalPrice.toFixed(2)} USD`;
      },
    },
    {
      title: "Foyda (USD)",
      key: "profit",
      render: (_, record) => {
        const profit =
          (record.sell_price - record.purchase_price) * record.stock;
        return `${profit.toFixed(2)} USD`;
      },
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            style={{ marginRight: "10px" }}
            onClick={() => showEditModal(record)}
          >
            <EditOutlined />
          </Button>
          <Button
            type="primary"
            style={{ marginRight: "10px" }}
            onClick={() => showTransferModal(record)}
          >
            <BiTransfer />
          </Button>
          <Popconfirm
            title="Haqiqatdan ham ushbu mahsulotni o'chirmoqchimisiz?"
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button type="primary" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Mahsulotni o'chirish
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Mahsulot muvaffaqiyatli o'chirildi!");
      refetch(); // Mahsulotlar ro'yxatini yangilash
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  // Conditional row styling based on stock quantity
  const rowClassName = (record) => {
    if (record.stock === 0) {
      return "red-row";
    } else if (record.stock <= 5) {
      return "yellow-row";
    } else {
      return "";
    }
  };

  // Mahsulotlarni qidirish
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Filterlarni qo'llash
  const handleFilterChange = (value) => {
    setStockFilter(value);
  };

  const filteredData = data
    ?.filter((product) => {
      if (stockFilter === "all") return true;
      if (stockFilter === "runningOut")
        return product.stock <= 5 && product.stock > 0;
      if (stockFilter === "outOfStock") return product.stock === 0;
      return true;
    })
    .filter(
      (product) =>
        product.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.model.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => a.stock - b.stock); // Qolgan miqdorga ko'ra tartiblash

  return (
    <div className="admin-container">
      <div className="admin-buttons">
        <PrintButton /> {/* PrintButton komponentini joylashtirish */}
      </div>
      <Modal
        title="Mahsulot yaratish"
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
                label="Sotish narxi (USD )"
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
              <Form.Item
                label="Brend nomi"
                name="brand_name"
                rules={[{ required: true, message: "Majburiy maydon!" }]}
              >
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
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Mahsulotni dokonga o'tkazish"
        open={isTransferModalOpen}
        onCancel={handleTransferCancel}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleAddToStore}>
          <Form.Item
            label="Miqdor"
            name="quantity"
            rules={[{ required: true, message: "Majburiy maydon!" }]}
          >
            <Input type="number" placeholder="Miqdor" autoComplete="off" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Dokonga o'tkazish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Tabs defaultActiveKey="1" style={{ flexGrow: 1, width: "100%" }}>
        {access?.skaladorlar && (
          <Tabs.TabPane
            tab={
              <Button type="primary" icon={<UserAddOutlined />}>
                Sklad tavar qo'shish
              </Button>
            }
            key="1"
          >
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
              Omborga Mahsulot qo'shish +
            </Button>
            <Input.Search
              placeholder="Mahsulot nomi yoki modeli bo'yicha qidirish..."
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300, marginLeft: 20 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 200, marginLeft: 20 }}
              onChange={handleFilterChange}
            >
              <Option value="all">Barcha mahsulotlar</Option>
              <Option value="runningOut">Tugayotgan mahsulotlar</Option>
              <Option value="outOfStock">Tugagan mahsulotlar</Option>
            </Select>
            <Table
              dataSource={filteredData?.filter(st => st?.storeProduct != true)}
              loading={isLoading}
              columns={columns}
              pagination={{ pageSize: 20 }}
              rowClassName={rowClassName}
              scroll={{ x: "max-content" }}
            />
          </Tabs.TabPane>
        )}
        {access?.adminlar && (
          <Tabs.TabPane
            tab={
              <Button type="default" icon={<UserAddOutlined />}>
                Admin qo'shish
              </Button>
            }
            key="2"
          >
            <Adminlar />
          </Tabs.TabPane>
        )}
        {access?.qarzdorlar && (
          <Tabs.TabPane
            tab={
              <Button type="default" icon={<TeamOutlined />} danger>
                Qarzdorlar
              </Button>
            }
            key="3"
          >
            <Qarzdor />
          </Tabs.TabPane>
        )}

        {access?.xisobot && (
          <Tabs.TabPane
            tab={
              <Button type="primary" icon={<BarChartOutlined />}>
                Xisobot
              </Button>
            }
            key="6"
          >
            <Xisobot />
          </Tabs.TabPane>
        )}
        {access?.sotuv_tarixi && (
          <Tabs.TabPane
            tab={
              <Button type="primary" icon={<HistoryOutlined />}>
                Sotuv
              </Button>
            }
            key="7"
          >
            <Sotuv_tarix />
          </Tabs.TabPane>
        )}
        {access?.SalesStatistics && (
          <Tabs.TabPane
            tab={<Button type="primary">statistika</Button>}
            key="8"
          >
            <SalesStatistics />
          </Tabs.TabPane>
        )}
        {access?.dokon && (
          <Tabs.TabPane tab={<Button type="primary">Dokon</Button>} key="9">
            <StoreItem />
          </Tabs.TabPane>
        )}
      </Tabs>

      <EditProductModal
        visible={isEditModalOpen}
        onCancel={handleEditComplete}
        product={editingProduct}
        usdRate={usdRate}
      />

      <PrintBarcodeModal
        visible={isPrintModalOpen}
        onCancel={handlePrintModalClose}
        barcode={barcode}
      />
    </div>
  );
};

export default Admin;

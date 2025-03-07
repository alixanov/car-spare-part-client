import React, { useRef, useState } from "react";
import {
  Input,
  Table,
  Card,
  Button,
  Modal,
  Select,
  message,
  Form,
  Input as AntdInput,
  DatePicker,
  Drawer
} from "antd";
import {
  useGetAllProductsQuery,
  useUpdateProductMutation,
} from "../../context/service/addproduct.service";
import { useRecordSaleMutation } from "../../context/service/sale.service";
import {
  useSellProductFromStoreMutation,
  useGetStoreProductsQuery,
} from "../../context/service/store.service";
import { useCreateDebtorMutation } from "../../context/service/debtor.service";
import { useGetUsdRateQuery } from "../../context/service/usd.service";
import "./Kassa.css";
import Qarzdor from "../qarzdorlar/Qarzdor";
import Xarajatlar from "../Xarajatlar/Xarajatlar";
import { useReactToPrint } from "react-to-print";
import moment from "moment-timezone";
import Vazvrat from "../vazvrat/Vazvrat";
import tgqr from "../../assets/Screenshot_1.png";

import {
  UserOutlined,DollarOutlined,RetweetOutlined
}from '@ant-design/icons';

const { Option } = Select;

export default function Kassa() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("naqd");
  const [debtorName, setDebtorName] = useState("");
  const [debtorPhone, setDebtorPhone] = useState("");
  const [chekModal, setChekModal] = useState(false);
  const [qarzdorModalVisible, setQarzdorModalVisible] = useState(false);
  const [xarajatlarModalVisible, setXarajatlarModalVisible] = useState(false);
  const [vazvratModalVisible, setVazvratModalVisible] = useState(false);
  const receiptRef = useRef();
  const [debtDueDate, setDebtDueDate] = useState(null);
  const { data: products, isLoading } = useGetAllProductsQuery();
  const { data: storeProducts } = useGetStoreProductsQuery();
  const { data: usdRateData } = useGetUsdRateQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [recordSale] = useRecordSaleMutation();
  const [sellProductFromStore] = useSellProductFromStoreMutation();
  const [createDebtor] = useCreateDebtorMutation();
  const [location, setLocation] = useState(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: "new document",
    pageStyle: "style",
    onAfterPrint: () => {
      setChekModal(false);
      setSelectedProducts([]);
    },
  });

  const filteredProducts = searchTerm
    ? products?.filter(
      (product) =>
        product.product_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_category
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    : [];

  const handleSelectProduct = (product) => {
    const exists = selectedProducts.find((item) => item._id === product._id);
    if (!exists) {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: 1,
          sell_price: product.sell_price * usdRateData.rate,
        },
      ]);
      setSearchTerm("");
    } else {
      message.info("Bu mahsulot allaqachon tanlangan");
    }
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = selectedProducts.filter(
      (item) => item._id !== productId
    );
    setSelectedProducts(updatedProducts);
  };

  const handleQuantityChange = (productId, increment) => {
    const updatedProducts = selectedProducts.map((item) => {
      if (item._id === productId) {
        const newQuantity = item.quantity + increment;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    });
    setSelectedProducts(updatedProducts);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSellProducts = async () => {
    setChekModal(true);
    try {
      for (const product of selectedProducts) {
        if (location === "skalad") {
          if (product.stock < product.quantity) {
            message.error(
              `${product.product_name} mahsuloti skaladda yetarli emas!`
            );
            return;
          }
          const newStock = product.stock - product.quantity;
          await updateProduct({ id: product._id, stock: newStock }).unwrap();

          if (paymentMethod === "qarz") {
            if (!debtorName || !debtorPhone) {
              message.error(
                "Qarzga sotishda mijozning ismi va telefoni kerak!"
              );
              return;
            }

            const debtor = {
              name: debtorName,
              phone: debtorPhone,
              debt_amount: product.sell_price * product.quantity,
              due_date: debtDueDate,
              product_id: product._id,
              product_name: product.product_name,
              sell_price: product.sell_price,
              product_quantity: product.quantity,
            };

            await createDebtor(debtor).unwrap();
          } else {
            const sale = {
              product_id: product._id,
              product_name: product.product_name,
              sell_price: product.sell_price,
              quantity: product.quantity,
              total_price: product.sell_price * product.quantity,
              payment_method: paymentMethod,
              product_quantity: product.quantity,
              debtor_name: null,
              debtor_phone: null,
              debt_due_date: null,
            };

            await recordSale(sale).unwrap();
          }
        } else if (location === "dokon") {
          const storeProduct = storeProducts.find(
            (p) => p.product_id?._id === product._id
          );
          if (!storeProduct) {
            message.error(
              `${product.product_name} mahsuloti dokonda mavjud emas!`
            );
            return;
          }
          if (storeProduct.quantity < product.quantity) {
            message.error(
              `${product.product_name} mahsuloti dokonda yetarli emas!`
            );
            return;
          }

          const newStoreStock = storeProduct.quantity - product.quantity;
          const updatedStoreProduct = {
            ...storeProduct,
            quantity: newStoreStock,
          };

          await sellProductFromStore({
            product_id: updatedStoreProduct.product_id._id,
            quantity: product.quantity,
          }).unwrap();

          if (paymentMethod === "qarz") {
            if (!debtorName || !debtorPhone) {
              message.error(
                "Qarzga sotishda mijozning ismi va telefoni kerak!"
              );
              return;
            }

            const debtor = {
              name: debtorName,
              product_quantity: product.quantity,
              phone: debtorPhone,
              debt_amount: product.sell_price * product.quantity,
              due_date: debtDueDate,
              product_id: product._id,
              sell_price: product.sell_price,
              product_name: product.product_name,
            };

            await createDebtor(debtor).unwrap();
          } else {
            const sale = {
              product_id: product._id,
              product_name: product.product_name,
              sell_price: product.sell_price,
              quantity: product.quantity,
              total_price: product.sell_price * product.quantity,
              payment_method: paymentMethod,
              product_quantity: product.quantity,
              debtor_name: null,
              debtor_phone: null,
              debt_due_date: null,
            };

            await recordSale(sale).unwrap();
          }
        }
      }

      message.success("Mahsulotlar muvaffaqiyatli sotildi!");
      setIsModalVisible(false);
      // window loading
      // window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      message.error(
        `Xatolik: ${error.data?.message || "Serverga ulanishda xatolik"}`
      );
    }
  };

  const totalAmount = selectedProducts.reduce((acc, product) => {
    return acc + product.sell_price * product.quantity;
  }, 0);

  const handleSellPriceChange = (productId, newPrice) => {
    const updatedProducts = selectedProducts.map((item) => {
      if (item._id === productId) {
        return { ...item, sell_price: parseFloat(newPrice) };
      }
      return item;
    });
    setSelectedProducts(updatedProducts);
  };
  console.log(selectedProducts);
  

  return (
    <div className="kassa-container">
      <Modal
        open={chekModal}
        style={{ display: "flex", justifyContent: "center" }}
        onCancel={() => setChekModal(false)}
        footer={[
          <Button type="primary" onClick={handlePrint}>
            Chop etish
          </Button>,
        ]}
        title="To'lov cheki"
      >
        <div
          className="receipt"
          ref={receiptRef}
          style={{
            width: "80mm",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            paddingInline: "2px",
            gap: "6px",
            display: "flex",
          }}
        >
          <h1 style={{ fontSize: "50px", textAlign: "center" }}>TRAVERSE</h1>
          <div className="chek_item">
            <p
              style={{
                fontSize: "20px",
                textAlign: "start",
                fontWeight: "bold",
              }}
            >
              Bobur: <span>+99890 740 74 00</span> <br />
              Abbosxon: <span>+99890 214 14 41</span> <br />
              Odilxon: <span>+99891 292 99 22</span>
            </p>
          </div>

          <p id="tgqr_p" style={{ textAlign: "center", fontSize: "16px" }}>
            Телеграм каналимизга уланиш учун QR-кодни телефонингизда сканер қилинг.
            <img id="tgqr" src={tgqr} alt="" />
          </p>
          <div className="chek_item">
            <b>
              Сана: <b>{moment().tz("Asia/Tashkent").format("DD.MM.YYYY HH:mm")}</b>
            </b>
          </div>
          <table className="table">
            <thead>
              <tr>
                <td>№</td>
                <td>Товар</td>
                <td>Улчов</td>
                <td>Сони</td>
                <td>Сумма</td>
              </tr>
            </thead>
            <tbody>
              {selectedProducts?.map((item, index) => (
                <tr key={item._id}>
                  <td style={{ paddingBlock: "20px" }}>{index + 1}</td>
                  <td style={{ paddingBlock: "20px" }}>{item.product_name}</td>
                  <td style={{ paddingBlock: "20px" }}>{item.count_type}</td>
                  <td style={{ paddingBlock: "20px" }}>{item.quantity}</td>
                  <td style={{ paddingBlock: "20px" }}>
                    {(item.quantity * item.sell_price).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} style={{ border: "none" }}></td>
                <td>
                  <h1>Жами:</h1>
                  {selectedProducts
                    .reduce((a, b) => a + b.quantity * b.sell_price, 0)
                    .toLocaleString()}
                </td>
              </tr>
              <br />
            </tbody>
          </table>
          <p
            style={{ fontSize: "20px", textAlign: "start", fontWeight: "bold" }}
          >
            <span>Бизда етказиб бериш хизмати мавжуд</span> <br />
            Magazin <span>+99898 772 00 72</span> <br />
          </p>
        </div>

        {/* Media Queries for Tablet and Mobile */}
        <style jsx>{`
    @media (max-width: 768px) {
      .receipt {
        width: 90%;
      }
      h1 {
        font-size: 36px;
      }
      p {
        font-size: 16px;
      }
      .chek_item p {
        font-size: 16px;
      }
      table thead td {
        font-size: 14px;
      }
      table tbody td {
        font-size: 14px;
        padding-block: 10px;
      }
    }

    @media (max-width: 480px) {
      .receipt {
        width: 100%;
      }
      h1 {
        font-size: 28px;
      }
      p {
        font-size: 14px;
      }
      .chek_item p {
        font-size: 14px;
      }
      table thead td {
        font-size: 12px;
      }
      table tbody td {
        font-size: 12px;
        padding-block: 8px;
      }
    }
  `}</style>
      </Modal>

      <Modal
        title="Qarzdorlar"
        open={qarzdorModalVisible}
        onCancel={() => setQarzdorModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: "800px", margin: "0 auto" }} // Ограничение максимальной ширины для больших экранов
      >
        <Qarzdor />

        {/* Media Queries for Tablet and Mobile */}
        <style jsx>{`
    @media (max-width: 768px) {
      .ant-modal {
        width: 90% !important;
        padding: 16px;
      }
    }

    @media (max-width: 480px) {
      .ant-modal {
        width: 100% !important;
        padding: 8px;
      }
    }
  `}</style>
      </Modal>

      <Modal
        title="Xarajatlar"
        open={xarajatlarModalVisible}
        onCancel={() => setXarajatlarModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: "800px", margin: "0 auto" }} // Ограничение максимальной ширины
      >
        <Xarajatlar />

        {/* Media Queries for Tablet and Mobile */}
        <style jsx>{`
    @media (max-width: 768px) {
      .ant-modal {
        width: 90% !important; // Ширина для планшетов
        padding: 16px;
      }
    }

    @media (max-width: 480px) {
      .ant-modal {
        width: 100% !important; // Ширина для мобильных
        padding: 8px;
      }
    }
  `}</style>
      </Modal>

      <Modal
        title="Vazvrat tavarlar"
        open={vazvratModalVisible}
        onCancel={() => setVazvratModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: "1150px", margin: "0 auto" }} // Ограничение максимальной ширины на больших экранах
      >
        <Vazvrat />

        {/* Media Queries for Tablet and Mobile */}
        <style jsx>{`
    @media (max-width: 768px) {
      .ant-modal {
        width: 90% !important; // Ширина для планшетов
        padding: 16px;
      }
    }

    @media (max-width: 480px) {
      .ant-modal {
        width: 100% !important; // Ширина для мобильных
        padding: 8px;
      }
    }
  `}</style>
      </Modal>

      <div className="kassa-header">
        {/* Buttons for desktop */}
        <Button
          type="primary"
          onClick={() => setQarzdorModalVisible(true)}
          style={{ marginRight: 10, marginBottom: 10 }}
          className="desktop-button"
        >
          Qarzdorlar
        </Button>
        <Button
          type="primary"
          onClick={() => setXarajatlarModalVisible(true)}
          style={{ marginRight: 10, marginBottom: 10 }}
          className="desktop-button"
        >
          Xarajatlar
        </Button>
        <Button
          type="primary"
          onClick={() => setVazvratModalVisible(true)}
          style={{ marginRight: 10, marginBottom: 10 }}
          className="desktop-button"
        >
          Vazvrat
        </Button>

        {/* Icons for mobile */}
        <Button
          type="primary"
          onClick={() => setQarzdorModalVisible(true)}
          icon={<UserOutlined />}
          className="mobile-button"
        />
        <Button
          type="primary"
          onClick={() => setXarajatlarModalVisible(true)}
          icon={<DollarOutlined />}
          className="mobile-button"
        />
        <Button
          type="primary"
          onClick={() => setVazvratModalVisible(true)}
          icon={<RetweetOutlined />}
          className="mobile-button"
        />

        {/* Media Queries for Tablet and Mobile */}
        <style jsx>{`
        .desktop-button {
          display: inline-block;
        }
        .mobile-button {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-button {
            display: none; /* Скрываем кнопки с текстом на мобильных устройствах */
          }
          .mobile-button {
            display: inline-block; /* Показываем иконки на мобильных */
            width: 48px;
            height: 48px;
            margin-right: 10px;
            margin-bottom: 10px;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px; /* Размер иконки */
          }
        }
      `}</style>
      </div>

      <Card
        title="Kassa"
        bordered={false}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column-reverse",
          alignItems: "stretch",
          backgroundColor: "#0F4C81",
          width: "80%",
          height: "100%",
          color: "white",
          borderRadius: 0.1,
          overflow: "auto",
        }}
        id="kassa"
      >
        <Input
          placeholder="shtrix kodi yoki katalog kiriting..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 20, width: "40%" }}
          size="large"
          className="input__kassa__table"
        />

        <Table
          className="table__ant"
          dataSource={filteredProducts}
          loading={isLoading}
          style={{ width: "100%" }}
          columns={[
            {
              title: "Mahsulot nomi",
              dataIndex: "product_name",
              key: "product_name",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Tan narxi",
              dataIndex: "purchase_price",
              key: "purchase_price",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Narxi (Som)",
              dataIndex: "sell_price",
              key: "sell_price",
              render: (text) => `${(text * usdRateData.rate).toFixed(2)} Som`,
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Skalad Miqdori",
              dataIndex: "stock",
              key: "stock",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Dokon Miqdori",
              dataIndex: "quantity",
              key: "quantity",
              render: (_, record) => {
                return storeProducts.find(
                  (product) => product.product_id?._id === record._id
                )?.quantity;
              },
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Shtrix kod",
              dataIndex: "barcode",
              key: "barcode",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Modeli",
              dataIndex: "model",
              key: "model",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Qutisi",
              dataIndex: "packing_type",
              key: "packing_type",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Izoh",
              dataIndex: "special_notes",
              key: "special_notes",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Brend",
              dataIndex: "brand_name",
              key: "brand_name",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "kimdan-kelgan",
              dataIndex: "kimdan_kelgan",
              key: "kimdan_kelgan",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Katalogi ",
              dataIndex: "product_category",
              key: "product_category",
              align: "left", // Выравнивание по левому краю
            },
            {
              title: "Harakatlar",
              key: "actions",
              render: (_, record) => (
                <Button type="primary" onClick={() => handleSelectProduct(record)}>
                  Tanlash
                </Button>
              ),
              align: "left", // Выравнивание по левому краю
            },
          ]}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />

        {selectedProducts.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h2>Tanlangan mahsulotlar:</h2>
            <Table
              dataSource={selectedProducts}
              style={{ width: "100%" }}
              columns={[
                { title: "Mahsulot nomi", dataIndex: "product_name", key: "product_name" },
                { title: "Tan narxi", dataIndex: "purchase_price", key: "purchase_price" },
                {
                  title: "Narxi (Som)",
                  render: (_, record) => (
                    <AntdInput
                      value={record.sell_price}
                      onChange={(e) => handleSellPriceChange(record._id, e.target.value)}
                    />
                  ),
                },
                { title: "Miqdori", dataIndex: "quantity", key: "quantity" },
                { title: "Shtrix kod", dataIndex: "barcode", key: "barcode" },
                {
                  title: "Soni",
                  key: "quantity",
                  render: (_, record) => (
                    <div>
                      <Button
                        onClick={() => handleQuantityChange(record._id, -1)}
                        disabled={record.quantity <= 1}
                      >
                        -
                      </Button>
                      <span style={{ margin: "0 10px" }}>{record.quantity}</span>
                      <Button onClick={() => handleQuantityChange(record._id, 1)}>
                        +
                      </Button>
                    </div>
                  ),
                },
                {
                  title: "Harakatlar",
                  key: "actions",
                  render: (_, record) => (
                    <Button type="primary" danger onClick={() => handleRemoveProduct(record._id)}>
                      O'chirish
                    </Button>
                  ),
                },
              ]}
              rowKey="_id"
              pagination={false}
            />

            <div style={{ marginTop: 20, fontSize: "1.5em" }}>
              <strong>Umumiy summa: </strong>
              {totalAmount.toFixed(2)} so'm
            </div>
            <Button type="primary" onClick={showModal} style={{ marginTop: 20 }}>
              Sotish
            </Button>
          </div>
        )}

        <Modal
          title="To'lov usulini tanlang"
          visible={isModalVisible}
          onOk={handleSellProducts}
          onCancel={handleCancel}
        >
          <Form layout="vertical">
            <Form.Item label="To'lov usuli">
              <Select
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value)}
                style={{ width: "100%" }}
              >
                <Option value="naqd">Naqd</Option>
                <Option value="plastik">Karta</Option>
                <Option value="qarz">Qarz</Option>
              </Select>
            </Form.Item>

            {paymentMethod === "qarz" && (
              <>
                <Form.Item label="Qarz oluvchi ismi">
                  <AntdInput value={debtorName} onChange={(e) => setDebtorName(e.target.value)} />
                </Form.Item>
                <Form.Item label="Qarz oluvchi telefon raqami">
                  <AntdInput value={debtorPhone} onChange={(e) => setDebtorPhone(e.target.value)} />
                </Form.Item>
                <Form.Item label="Qarz muddatini kiriting">
                  <DatePicker
                    value={debtDueDate}
                    onChange={(date) => setDebtDueDate(date)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </>
            )}

            <Form.Item label="Joylashuv">
              <Select
                value={location}
                onChange={(value) => setLocation(value)}
                style={{ width: " 100%" }}
              >
                <Option value="skalad">Skalad</Option>
                <Option value="dokon">Dokon</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Responsive Styles */}
        <style jsx>{`
    @media (max-width: 768px) {
      #kassa {
        width: 100%;
      }
      .ant-input {
        width: 100% !important;
      }
      .ant-table {
        font-size: 12px; // Уменьшаем шрифт таблицы для планшетов
      }
    }

    @media (max-width: 480px) {
      #kassa {
        width: 100%;
      }
      .ant-input {
        width: 100% !important;
      }
      .ant-table {
        font-size: 10px; // Еще больше уменьшаем шрифт для мобильных
      }
      .ant-table th,
      .ant-table td {
        padding: 8px;
      }
      .ant-btn {
        font-size: 14px;
        padding: 6px 12px;
      }
    }
  `}</style>
      </Card>

    </div>
  );
}
// bitdi

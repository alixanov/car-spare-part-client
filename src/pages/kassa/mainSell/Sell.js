import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Input, Table, message } from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { IoBackspaceOutline } from "react-icons/io5";
import { TbArrowBackUp } from "react-icons/tb";
import "./style.css";
import "antd/dist/reset.css";
import emptyCart from "../../../assets/pngwing.com.png";
import { handleSetPrice } from "./service/handleSetPrice";
import { handleEnter } from "./service/handleEnter";
import {
  useGetProductByIdMutation,
  useGetAllProductsQuery,
} from "../../../context/service/addproduct.service";

const Sell = () => {
  const [input, setInput] = useState("");
  const [inputBarcode, setInputBarcode] = useState("");
  const [inputReturn, setInputReturn] = useState("");
  const [inputVazvrat, setInputVazvrat] = useState(false);
  const [inputVazvratSet, setInputVazvratSet] = useState("");
  // const [mahsulotlar, setMahsulotlar] = useState([]);
  const [cart, setCart] = useState([]);
  const prevInputRef = useRef("");
  const sellerData = JSON.parse(localStorage.getItem("admin") || "null");

  const [getProductById, { data: submitOrder, error }] =
    useGetProductByIdMutation(); // Define the hook outside of useEffect
  const { data: data } = useGetAllProductsQuery(); // Define the hook outside of useEffect
  const mahsulotlar = data?.innerData || [];
  console.log(mahsulotlar);

  // useEffect(() => {
  //     if (input !== "") {
  //         const fetchData = async () => {
  //             try {
  //                 const response = await getProductById(input).unwrap();

  //                 if (response && response.status === 'success' && Array.isArray(response.innerData)) {
  //                     setMahsulotlar(response?.innerData); // innerData'ni to'g'ri mahsulotlar qiymatiga o'rnatish
  //                 } else {
  //                     setMahsulotlar([]); // mahsulotlar qiymatini bo'sh massiv qilib qo'yish
  //                     console.error('Invalid response format:', response);
  //                 }

  //                 setInput('');
  //             } catch (err) {
  //                 console.error('Error fetching product:', err);
  //                 setMahsulotlar([]); // Xato bo'lganda mahsulotlar qiymatini bo'sh massiv qilib qo'yish
  //             }
  //         };

  //         fetchData();
  //     }
  // }, [input, getProductById]);

  const handleClick = (value) => {
    inputBarcode
      ? setInputBarcode((prev) => prev + value)
      : setInput((prev) => prev + value);
  };

  const handleDelete = () => setInput(input.slice(0, -1));
  const handleClear = () => setInput("");
  const handleClearInput = () => setInput("");
  const handleCancelItem = () => setCart([]);
  const handleDeleteItem = () => setCart(cart.slice(0, -1));

  const onSetPriceClick = () => {
    handleSetPrice({
      inputVazvratSet,
      setCart,
      setInput,
      setInputVazvrat,
    });
  };

  const onEnterPress = () => {
    handleEnter({
      input,
      inputBarcode,
      setInput,
      setInputBarcode,
      mahsulotlar,
      cart,
      setCart,
    });
  };

  const handleViewChecks = () => {
    alert("Просмотр чеков!");
  };

  const handlePayment = async (paymentType) => {
    try {
      const orderData = {
        SellerFullName: sellerData.fullname,
        kassaNumber: sellerData.kassaNumber,
        totalAmount: totalAmount,
        payState: paymentType, // Оплата по карте uchun true, наличными uchun false
        products: cart?.map((item) => ({
          barcode: item.barcode,
          name: item.nomi,
          quantity: item.quantity,
          price: item.selling_price,
        })),
      };
      console.log(orderData);
      // console.log(orderData);
      await submitOrder(orderData).unwrap();
      message.success(`Оплата произведена!`);
      setCart([]); // To'lov amalga oshirilgandan so'ng cartni tozalash
    } catch (error) {
      console.error("Order submission failed:", error);
      alert(`Оплата не удалась.`);
    }
  };

  const totalAmount = cart?.reduce(
    (sum, item) => sum + item.quantity * item.selling_price,
    0
  );
  const totalItems = cart?.length;
  const totalQuantity = cart?.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (
      input.length >= 8 &&
      input.length <= 13 &&
      prevInputRef.current !== input
    ) {
      const foundProduct = mahsulotlar.find(
        (product) => product.barcode === input
      );
      if (foundProduct) {
        const existingProduct = cart.find((item) => item.barcode === input);
        if (existingProduct) {
          setCart(
            cart?.map((item) =>
              item.barcode === input
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          setCart([...cart, { ...foundProduct, quantity: 1 }]);
        }
      }
      prevInputRef.current = input;
      setInputBarcode(input); // input ni inputBarcode ga uzatadi
      setInput(""); // input ni tozalaydi
    }
  }, [input, mahsulotlar, cart]);

  const columns = [
    {
      title: "№",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    { title: "Штрих-код", dataIndex: "barcode", key: "barcode" },
    { title: "Товар", dataIndex: "title", key: "title" },
    {
      title: "Цена",
      dataIndex: "selling_price",
      key: "selling_price",
      render: (text) => text.toLocaleString() + "  сум",
    },
    { title: "Количество", dataIndex: "quantity", key: "quantity" },
    {
      title: "Общая стоимость",
      key: "total",
      render: (text, record) => {
        const total = Math.floor(record.quantity * record.selling_price);
        return total.toLocaleString() + "  сум";
      },
    },
  ];

  // Raqamni formatlash uchun funksiya
  const formatNumber = (value) => {
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  // Qaytimni hisoblash funksiyasi
  const calculateChange = () => {
    const paidAmount = parseFloat(inputReturn.replace(/\s+/g, "")); // Kiritilgan raqamni raqam sifatida olish
    if (isNaN(paidAmount)) return 0; // Agar qiymat raqam bo'lmasa

    const change = paidAmount - totalAmount;
    return change > 0 ? formatNumber(change) : 0; // Manfiy bo'lmasligi uchun
  };

  // Input o'zgarganda chaqiriladigan funksiya
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Faqat raqamlarni qabul qilish
    setInputReturn(formatNumber(value)); // Formatlangan raqamni inputga o'rnatish
  };

  // Input qiymatini tozalash funksiyasi
  const handleReset = () => {
    setInputReturn("");
  };
  // Input qiymatini tozalash funksiyasi
  const handleResetBarcode = () => {
    setInputVazvrat(false);
    setInputVazvratSet("");
  };

  return (
    <div className="container-sall">
      <div className="sall-boxs_cart">
        <div
          style={{
            width: "100%",
            height: "460px",
            overflowY: "auto",
            scrollbarWidth: "thin", // Firefox uchun
            scrollbarColor: "#888 #f1f1f1", // Firefox uchun thumb va track ranglari
          }}
        >
          {cart?.length === 0 ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img width={450} src={emptyCart} alt="No Data" />
            </div>
          ) : (
            <Table
              size="small"
              dataSource={cart}
              columns={columns}
              rowKey="barcode"
              pagination={false}
            />
          )}
          <style jsx>{`
            /* Webkit uchun scrollbar uslubi */
            div::-webkit-scrollbar {
              width: 4px !important;
            }

            div::-webkit-scrollbar-track {
              background: #f1f1f1;
            }

            div::-webkit-scrollbar-thumb {
              background-color: #888;
              border-radius: 10px;
              border: 1px solid #f1f1f1;
            }

            div::-webkit-scrollbar-thumb:hover {
              background-color: #555;
            }
          `}</style>
        </div>

        <div className="checkout-container">
          <div className="checkout-header">
            <div className="subtotal">
              <span style={{ color: "grey" }}>Итого: </span>
              <span> {totalAmount.toLocaleString()} сум</span>
            </div>

            <div className="checkout-header-right">
              {inputReturn !== "" && inputReturn !== "0" && (
                <h3>Сдача: {calculateChange()} сум</h3>
              )}

              <input
                value={inputReturn}
                onChange={handleInputChange}
                placeholder="Введите сумму..."
                type="text"
              />
              {inputReturn !== "" && inputReturn !== "0" && (
                <button onClick={handleReset} style={{ marginTop: "10px" }}>
                  <CloseOutlined />
                </button>
              )}
            </div>
          </div>
          <div className="details">
            <div className="detail-item">
              <span style={{ color: "grey" }}>Количество товаров:</span>
              <span>{totalItems}</span>
            </div>
            <div className="detail-item">
              <span style={{ color: "grey" }}>Количество:</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="detail-item">
              <span style={{ color: "grey" }}>Общая сумма:</span>
              <span>{totalAmount.toLocaleString()} сум</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sall-boxs_count">
        <div style={{ padding: 8, maxWidth: 400 }}>
          {inputVazvrat ? (
            <div className="custom-placeholder-input-reset">
              <Input
                value={inputVazvratSet + input}
                onChange={(e) => setInputVazvratSet(e.target.value)}
                className="custom-placeholder-input" // Add custom class
                style={{
                  marginBottom: 10,
                  backgroundColor: "#f0f0f073",
                  fontSize: "18px",
                }}
                placeholder="Введите штрих-код" // Russian placeholder
                autoFocus
                reset
              />
              {inputVazvratSet !== "" && inputVazvratSet !== "0" && (
                <button
                  onClick={handleResetBarcode}
                  style={{ marginTop: "10px" }}
                >
                  <CloseOutlined />
                </button>
              )}
            </div>
          ) : (
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                marginBottom: 10,
                backgroundColor: "#f0f0f073",
                fontSize: "18px",
              }}
              autoFocus
            />
          )}
          {inputBarcode !== "" ? (
            <Input
              value={inputBarcode}
              onChange={(e) => setInputBarcode(e.target.value)}
              style={{
                marginBottom: 10,
                backgroundColor: "#f0f0f0",
                fontSize: "18px",
              }}
            />
          ) : (
            ""
          )}
          <Row style={{ borderBottom: ".5px solid grey" }} gutter={[10, 10]}>
            <Col span={6}>
              <Button
                style={{
                  backgroundColor: "#f0f0f0",
                  width: "52px",
                  fontSize: "24px",
                  height: "35px",
                }}
                onClick={handleDelete}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <IoBackspaceOutline style={{ fontSize: "26px" }} />
                </div>
              </Button>
            </Col>
            <Col span={6}>
              <Button
                onClick={handleClear}
                style={{
                  backgroundColor: "#f0f0f0",
                  width: "52px",
                  fontSize: "24px",
                  height: "35px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span>C</span>
                </div>
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("*")}
              >
                *
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{
                  width: "52px",
                  fontSize: "24px",
                  height: "35px",
                  backgroundColor: "#ff4d4f",
                  color: "#fff",
                }}
                icon={<DeleteOutlined />}
                onClick={handleClearInput}
              />
            </Col>

            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("7")}
              >
                7
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("8")}
              >
                8
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("9")}
              >
                9
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{
                  width: "52px",
                  fontSize: "24px",
                  height: "35px",
                  backgroundColor: "#fadb14",
                  color: "#000",
                }}
                icon={<MinusOutlined />}
                onClick={() => handleClick("-")}
              />
            </Col>

            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("4")}
              >
                4
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("5")}
              >
                5
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("6")}
              >
                6
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{
                  width: "52px",
                  fontSize: "24px",
                  height: "35px",
                  backgroundColor: "#1890ff",
                  color: "#fff",
                }}
                icon={<PlusOutlined />}
                onClick={() => handleClick("+")}
              />
            </Col>

            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("1")}
              >
                1
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("2")}
              >
                2
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("3")}
              >
                3
              </Button>
            </Col>
            {inputVazvrat ? (
              <Col span={6}>
                <Button
                  style={{
                    width: "52px",
                    fontSize: "16px",
                    height: "35px",
                    backgroundColor: "#52c41a",
                    color: "#fff",
                  }}
                  onClick={onSetPriceClick}
                >
                  Ввод
                </Button>
              </Col>
            ) : (
              <Col span={6}>
                <Button
                  style={{
                    width: "52px",
                    fontSize: "16px",
                    height: "35px",
                    backgroundColor: "#52c41a",
                    color: "#fff",
                  }}
                  onClick={onEnterPress}
                >
                  Ввод
                </Button>
              </Col>
            )}
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("0")}
              >
                0
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("00")}
              >
                00
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick("000")}
              >
                000
              </Button>
            </Col>
            <Col span={6}>
              <Button
                style={{ width: "52px", fontSize: "24px", height: "35px" }}
                onClick={() => handleClick(",")}
              >
                ,
              </Button>
            </Col>
          </Row>

          <hr style={{ marginTop: "8px" }} />

          <Row gutter={[10, 10]} style={{ marginTop: 10 }} wrap>
            <div className="cal-box">
              <Button
                className="cal-buttons"
                style={{ backgroundColor: "#fadb14", color: "#fff" }}
                onClick={handleDeleteItem}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <DeleteOutlined style={{ marginBottom: "-5px" }} />
                  <span>удалить</span>
                </div>
              </Button>
              <Button
                className="cal-buttons"
                style={{ backgroundColor: "#ff4d4f", color: "#fff" }}
                onClick={handleCancelItem}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <CloseOutlined style={{ marginBottom: "-5px" }} />
                  <span>Отмена</span>
                </div>
              </Button>
              {/* <Button className="cal-buttons" onClick={handleSetPrice}> */}
              <Button
                className="cal-buttons"
                onClick={() => setInputVazvrat(true)}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* <IoReturnUpBack style={{ marginBottom: "-5px",fontSize:"19px" }} /> */}
                  <TbArrowBackUp
                    style={{ marginBottom: "-5px", fontSize: "20px" }}
                  />
                  <span>Вoзврат</span>
                </div>
              </Button>
            </div>

            <div style={{ gap: "10px" }} className="cal-box">
              <Button
                className="cal-buttons"
                style={{ width: "48%", backgroundColor: "#f0f0f0" }}
                onClick={handleViewChecks}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <FileTextOutlined style={{ marginBottom: "-5px" }} />
                  <span>Чеки</span>
                </div>
              </Button>
              <Button
                className="cal-buttons"
                style={{ width: "48%", backgroundColor: "#f0f0f0" }}
                onClick={handleViewChecks}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <DollarOutlined style={{ marginBottom: "-5px" }} />
                  <span>Закрыть кассу</span>
                </div>
              </Button>
            </div>

            <div style={{ gap: "10px" }} className="cal-box">
              <Button
                className="cal-buttons"
                style={{
                  width: "48%",
                  backgroundColor: "#1890ff",
                  color: "#fff",
                }}
                onClick={() => handlePayment(false)}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <CreditCardOutlined style={{ marginBottom: "-5px" }} />
                  <span style={{ fontSize: "11px" }}>Оплата наличными</span>
                </div>
              </Button>
              <Button
                className="cal-buttons"
                style={{
                  width: "48%",
                  backgroundColor: "#13c2c2",
                  color: "#fff",
                }}
                onClick={() => handlePayment(true)}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <CreditCardOutlined style={{ marginBottom: "-5px" }} />
                  <span style={{ fontSize: "12px" }}>Оплата по карте</span>
                </div>
              </Button>
            </div>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Sell;

// console.log(mahsulotlar);

// const mahsulotlar = [
//     { barcode: '1001000124425', title: 'Non', selling_price: 1500 },
//     { barcode: '100200028', title: 'Sut', selling_price: 5000 },
//     { barcode: '4870001572242', title: 'Tuxum', selling_price: 12000 },
//     { barcode: '4780123120019', title: 'Pishloq', selling_price: 25000 },
//     { barcode: '1005000400', title: 'Sariyog‘', selling_price: 18000 },
//     { barcode: '1006000500000', title: 'Tovuq go‘shti', selling_price: 32000 },
//     { barcode: '46262752', title: 'Guruch', selling_price: 9000 },
//     { barcode: '4780046950311', title: 'Makaron', selling_price: 8000 },
//     { barcode: '1009000788855', title: 'Pamidor', selling_price: 6000 },
//     { barcode: '1823089500331', title: 'Piyoz', selling_price: 3000 },
//     { barcode: '10110009', title: 'Olma', selling_price: 10000 },
//     { barcode: '1012001012', title: 'Apelsin', selling_price: 12000 },
//     { barcode: '10130011', title: 'Banan', selling_price: 15000 },
//     { barcode: '10140012345', title: 'Kartoshka', selling_price: 4000 },
//     { barcode: '101500136', title: 'Sabzi', selling_price: 5000 },
// ];

// Functions for handling inputs

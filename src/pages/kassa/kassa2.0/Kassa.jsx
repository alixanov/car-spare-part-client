import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Form, Input, Button } from "antd"; // Ant Design komponentlari
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
// import logo  from "../../../assets/AJMEDICAL.png"
// import 'antd/dist/antd.css'; // Ant Design CSS

const Kassa = () => {
  const [products, setProducts] = useState([]);
  const [basket, setBasket] = useState([]);
  const barcodeRef = useRef();
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [clientSum, setClientSum] = useState();
  useEffect(() => {
    setClientSum(
      basket.reduce((a, b) => a + b.sellingPrice * b.sellingQuantity, 0)
    );
  }, [basket]);

  useEffect(() => {
    axios
      .get("https://car-spare-part-server.vercel.app/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const barcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(
      (product) => product.brCode === barcodeRef.current.value
    );
    if (product) {
      product.sellingQuantity = 1;
      setBasket([...basket, product]);
      barcodeRef.current.value = "";
    }
  };

  useEffect(() => {
    const newTotal = basket.reduce(
      (acc, product) => acc + product.sellingPrice * product.sellingQuantity,
      0
    );
    setTotal(newTotal);
  }, [basket]);

  const plus = (id) => {
    setBasket((prevBasket) =>
      prevBasket.map((product) =>
        product._id === id
          ? {
            ...product,
            sellingQuantity: Math.min(
              product.sellingQuantity + 1,
              product.quantity
            ),
          }
          : product
      )
    );
  };

  const minus = (id) => {
    setBasket((prevBasket) =>
      prevBasket.map((product) =>
        product._id === id
          ? {
            ...product,
            sellingQuantity: Math.max(product.sellingQuantity - 1, 1),
          }
          : product
      )
    );
  };

  const deleteItem = (id) => {
    setBasket((prevBasket) =>
      prevBasket.filter((product) => product._id !== id)
    );
  };

  const printCheck = () => {
    const printWindow = window.open("", "", "height=auto,width=80mm");

    // Rasmni base64 formatida qo'shish

    printWindow.document.write(`
    <html>
      <head>
        <title>Check</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            width: 80mm;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          h2, p {
            text-align: center;
          }
          .end {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-inline: 12px;
          }
            #yulduzcha{
  font-size: 22px;
  font-weight: bold;
  
}
        </style>
      </head>
      <body>
        <!-- Rasm qo'shish -->
        <h1>DEMO USER</h1>
        <p id="yulduzcha" >**************************************</p>
        <p>тел:+998939075350</p>
        <p id="yulduzcha">***************************************</p>
        <div class="end">
          <p>
          ${`${String(new Date().getDate()).padStart(2, "0")}.${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}.${new Date().getFullYear()}`}
          </p>
          <p>
          ${String(new Date().getHours()).padStart(2, "0")}:${String(
      new Date().getMinutes()
    ).padStart(2, "0")}
          </p>
        </div>
        <p>------------------------------------------------------</p>
        <div class="products">
  `);
    basket.forEach((product, index) => {
      printWindow.document.write(`
        <p style="text-align: left; margin-left:9px;">${index + 1}. ${product.name
        }</p>
        <div class="end">
        <p>${product.sellingQuantity} * ${product.sellingPrice} </p>
        <p>= ${product.sellingPrice * product.sellingQuantity} UZS </p>
        </div>
    `);
    });
    printWindow.document.write(`
        </div>
        <p style="font-size: 30px"><strong style="font-size: 30px">Итог:</strong> ${total} UZS</p>
        <p>=================================</p>
        <p>Обмен или возврат только при наличии чека</p>
        <p id="yulduzcha">***************************************</p>

        <p>СПАСИБО ПОКУПКУ!</p>
        <p id="yulduzcha">***************************************</p>

      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const submitData = (values) => {
    const totalDebt = basket.reduce(
      (a, b) => a + b.sellingPrice * b.sellingQuantity,
      0
    );
    values.totaldebt = +totalDebt;
    values.debt = values.paymentAmount < totalDebt;

    values.totalProduct = basket.map((i) => ({
      name: i.name,
      quantity: i.sellingQuantity,
      sellingPrice: i.sellingPrice,
      purchasePrice: i.purchasePrice,
    }));

    if (window.confirm("Rostan ham sotmoqchimisiz?")) {
      axios
        .post("https://car-spare-part-server.vercel.app/api/sold", values)
        .then((response) => {
          basket.forEach((product) => {
            axios
              .put(
                `https://car-spare-part-server.vercel.app/api/products/${product._id}`,
                {
                  quantity: product.quantity - product.sellingQuantity,
                }
              )
              .catch((error) => console.log(error));
          });
          setBasket([]);
          setTotal(0);
          printCheck();
          setVisible(false);
        })
        .catch((error) => console.log(error));
    }
  };
  console.log(clientSum);
  console.log(
    basket.reduce((a, b) => a + b.sellingPrice * b.sellingQuantity, 0)
  );

  return (
    <div className="kassa_wrapper">
      <Rodal height={450} visible={visible} onClose={() => setVisible(false)}>
        <div style={{ padding: "20px" }}>
          <h3>Foydalanuvchi ma'lumotlari</h3>
          <Form
            layout="vertical"
            onFinish={submitData}
            initialValues={{
              fullname: "",
              address: "",
              phone: "",
              paymentAmount: "",
            }}
          >
            <Form.Item
              label="To'lov summasi"
              name="paymentAmount"
              rules={[
                { required: true, message: "To'lov summasini kiriting!" },
              ]}
            >
              <Input
                type="number"
                onChange={(e) => setClientSum(e.target.value)}
                placeholder="To'lov summasi"
              />
            </Form.Item>


            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Yuborish
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Rodal>

      <form onSubmit={barcodeSubmit} className="kassa_head">
        <input ref={barcodeRef} autoFocus type="text" />
        <button>Submit</button>
      </form>

      <div className="kassa_body">
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Nº</Th>
                <Th>Nomi</Th>
                <Th>Sotish narxi</Th>
                <Th>Jami</Th>
                <Th>Kategoriya</Th>
                <Th>Sotilayotgan soni</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {basket.length > 0 ? (
                basket.map((product, index) => (
                  <Tr key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{product.name}</Td>
                    <Td>{product.sellingPrice}</Td>
                    <Td>{product.quantity}</Td>
                    <Td>{product.category}</Td>
                    <Td id="quantity">
                      <button onClick={() => minus(product._id)}>-</button>
                      {product.sellingQuantity}
                      <button id="plus" onClick={() => plus(product._id)}>
                        +
                      </button>
                    </Td>
                    <Td>
                      <button onClick={() => deleteItem(product._id)}>
                        Delete
                      </button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="7">Sotilayotgan mahsulotlar yo'q</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </div>

      <div className="kassa_footer">
        <b>Jami to'lov: {total} UZS</b>
        <button disabled={basket.length < 1} onClick={() => setVisible(true)}>
          Sotish
        </button>
      </div>
    </div>
  );
};

export default Kassa;

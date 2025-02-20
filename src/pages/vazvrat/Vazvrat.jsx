import React, { useEffect, useState } from "react";
import { Input, Button, Table, Modal, Select, message } from "antd";
import { useGetSalesHistoryQuery } from "../../context/service/sale.service";
import { useVazvratTovarMutation } from "../../context/service/store.service";
import moment from "moment";
import { useForm } from "react-hook-form";

const { Option } = Select;

export default function Vazvrat() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("product_name");
  const {
    data: saleHistory = [],
    error,
    isLoading,
  } = useGetSalesHistoryQuery();
  const [selectedProduct, setSelectedProduct] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const [vazvratSale, setVazvratSale] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vazvratTovar] = useVazvratTovarMutation();

  const handleSearch = () => {
    if (searchTerm === "") {
      setSelectedProduct([]);
      return;
    }
    const foundProducts = saleHistory.filter(
      (product) =>
        product.product_id &&
        product.product_id[searchType]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    console.log(foundProducts);

    if (foundProducts.length > 0) {
      setSelectedProduct(foundProducts);
    } else {
      setSelectedProduct([]);
    }
  };

  const handleReturnProduct = async (data) => {
    if (!vazvratSale) {
      message.error("Mahsulot va miqdorni tanlang");
      return;
    }
    const productId = await saleHistory.find((item) => item._id === vazvratSale)
      .product_id._id;
    console.log({
      product_id: productId,
      quantity: Number(data.quantity),
      sale_id: vazvratSale,
    });

    try {
      await vazvratTovar({
        product_id: productId,
        quantity: Number(data.quantity),
        sale_id: vazvratSale,
      });

      message.success("Mahsulot qaytarildi");
      setIsModalVisible(false);
      setVazvratSale("");
      setSearchTerm("");
      //  refresh
      window.location.reload();
    } catch (error) {
      message.error("Qaytarishda xatolik yuz berdi.");
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, searchType]);

  const handleCancel = () => {
    setIsModalVisible(false);
    setVazvratSale("");
    reset({ quantity: null });
  };
  console.log(vazvratSale);

  const columns = [
    {
      title: "Mahsulot nomi",
      dataIndex: ["product_id", "product_name"],
      key: "product_name",
    },
    {
      title: "Modeli",
      dataIndex: ["product_id", "model"],
      key: "model",
    },
    {
      title: "Brend nomi",
      dataIndex: ["product_id", "brand_name"],
      key: "brand_name",
    },
    {
      title: "Katalogi",
      dataIndex: ["product_id", "product_category"],
      key: "product_category",
    },
    {
      title: "Shtrix kod",
      dataIndex: ["product_id", "barcode"],
      key: "barcode",
    },
    {
      title: "Kimdan kelgan",
      dataIndex: ["product_id", "kimdan_kelgan"],
      key: "kimdan_kelgan",
    },
    {
      title: "O'lchov birligi",
      dataIndex: ["product_id", "count_type"],
      key: "count_type",
    },
    {
      title: "Qadoq turi",
      dataIndex: ["product_id", "packing_type"],
      key: "packing_type",
    },
    {
      title: "Maxsus eslatmalar",
      dataIndex: ["product_id", "special_notes"],
      key: "special_notes",
    },
    {
      title: "Soni",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Sotish narxi",
      render: (_, record) => record.sell_price.toLocaleString(),
    },
    {
      title: "Sana",
      render: (_, record) =>
        moment(record.createdAt).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          onClick={() => {
            setIsModalVisible(true);
            setVazvratSale(record._id);
          }}
          disabled={!selectedProduct}
        >
          Vazvrat qilish
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Select
        defaultValue="product_name"
        style={{ width: 200, marginBottom: "20px" }}
        onChange={(value) => setSearchType(value)}
      >
        <Option value="product_name">Mahsulot nomi</Option>
        <Option value="barcode">Shtrix kod</Option>
        <Option value="product_category">Katalogi</Option>
        <Option value="model">Model</Option>
        <Option value="kimdan_kelgan">Kimdan kelgan</Option>
      </Select>

      <Input
        placeholder="Qidiruv"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "300px", marginBottom: "20px" }}
        size="large"
      />

      <Button
        type="primary"
        onClick={handleSearch}
        style={{ marginLeft: "10px" }}
        loading={isLoading}
      >
        Qidirish
      </Button>

      {selectedProduct && (
        <Table dataSource={selectedProduct} rowKey="_id" columns={columns} />
      )}

      <Modal
        title="Mahsulotni qaytarish"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[]}
      >
        <form
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          onSubmit={handleSubmit(handleReturnProduct)}
        >
          <span>
            Sotish soni:{" "}
            {saleHistory?.find((item) => item?._id === vazvratSale)?.quantity}
          </span>
          <label>Qaytarilayotgan mahsulot soni:</label>
          <input
            style={{
              border: "1px solid #ccc",
              height: "40px",
              paddingInline: "6px",
            }}
            {...register("quantity")}
            type="number"
          />
          <Button type="primary" htmlType="submit">
            Qaytarish
          </Button>
        </form>
      </Modal>
    </div>
  );
}

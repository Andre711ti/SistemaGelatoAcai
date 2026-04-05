import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Payment } from "mercadopago";
import pool from "./db.js"; // 👈 IMPORTA O BANCO

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 CONFIGURA O SDK DO MERCADO PAGO
const mp = new MercadoPagoConfig({
    accessToken: "TEST-7522432125880457-120918-68cd9688ea1c2b0b2a771c749f55af4d-3053155925"
});

// ===============================
// 🧪 TESTE DE CONEXÃO COM O BANCO
// ===============================
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders LIMIT 1");
    res.json({ status: "conectado", rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// ===============================
// 📌 CRIAR PIX
// ===============================
app.post("/criar-pix", async (req, res) => {
    try {
        const { valor } = req.body;
        const payment = new Payment(mp);

        const pagamento = await payment.create({
            body: {
                transaction_amount: Number(valor),
                description: "Pedido Gelato's Açai",
                payment_method_id: "pix",
                payer: {
                    email: "cliente@email.com"
                }
            }
        });

        return res.json({
            id: pagamento.id,
            copiaecola: pagamento.point_of_interaction.transaction_data.qr_code,
            qr_base64: pagamento.point_of_interaction.transaction_data.qr_code_base64
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ erro: "Erro ao criar cobrança PIX" });
    }
});

// ===============================
// 📦 CRIAR PEDIDO
// ===============================
app.post("/orders", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Pedido sem itens" });
    }

    // inicia transação
    await connection.beginTransaction();

    // cria pedido
    const [orderResult] = await connection.query(
      "INSERT INTO orders (order_number, status) VALUES (?, ?)",
      [Date.now().toString(), "novo"]
    );

    const orderId = orderResult.insertId;

    // cria itens
    for (const item of items) {
      const [itemResult] = await connection.query(
        "INSERT INTO order_items (order_id, product_name, size) VALUES (?, ?, ?)",
        [orderId, item.product_name, item.size]
      );

      const itemId = itemResult.insertId;

      // cria opções (fruta, complemento, adicional)
      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          await connection.query(
            "INSERT INTO order_item_options (order_item_id, type, name) VALUES (?, ?, ?)",
            [itemId, option.type, option.name]
          );
        }
      }
    }

    // confirma transação
    await connection.commit();

    res.json({
      success: true,
      order_id: orderId
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      error: "Erro ao criar pedido"
    });

  } finally {
    connection.release();
  }
});
// ===============================
// 📌 CONSULTAR STATUS PIX
// ===============================


// ===============================
app.listen(3000, () => {
    console.log("Servidor iniciado 🚀 rodando na porta 3000");
});

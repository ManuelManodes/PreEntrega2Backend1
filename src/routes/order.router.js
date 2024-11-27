// Importaciones de módulos y clases necesarias
import { Router } from "express"; // Importa el Router de Express para definir rutas
import OrderManager from "../managers/OrderManager.js"; // Importa la clase OrderManager para gestionar los pedidos

// Inicialización del router y del gestor de pedidos
const router = Router();
const orderManager = new OrderManager();

/**
 * Ruta para obtener todos los pedidos
 * Método: GET
 * Endpoint: /
 * Respuesta:
 *  - 200: Lista de pedidos obtenida exitosamente
 *  - 500: Error interno del servidor
 */
router.get("/", async (req, res) => {
    try {
        const orders = await orderManager.getAll(); // Obtiene todos los pedidos
        res.status(200).json({ status: "success", payload: orders }); // Responde con la lista de pedidos
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para obtener un pedido específico por su ID
 * Método: GET
 * Endpoint: /:id
 * Parámetros:
 *  - id: ID del pedido a obtener
 * Respuesta:
 *  - 200: Pedido obtenido exitosamente
 *  - 404: Pedido no encontrado
 *  - 500: Error interno del servidor
 */
router.get("/:id", async (req, res) => {
    try {
        const order = await orderManager.getOneById(req.params.id); // Obtiene el pedido por ID
        res.status(200).json({ status: "success", payload: order }); // Responde con el pedido obtenido
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para crear un nuevo pedido
 * Método: POST
 * Endpoint: /
 * Cuerpo de la solicitud:
 *  - sku_list: Lista de SKUs y cantidades
 *  - cliente: Nombre del cliente
 *  - fecha_pedido: Fecha del pedido
 * Respuesta:
 *  - 201: Pedido creado exitosamente
 *  - 400: Faltan datos obligatorios
 *  - 500: Error interno del servidor
 */
router.post("/", async (req, res) => {
    try {
        const order = await orderManager.insertOne(req.body); // Crea un nuevo pedido con los datos proporcionados
        res.status(201).json({ status: "success", payload: order }); // Responde con el pedido creado
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para agregar un SKU a un pedido existente o incrementar su cantidad
 * Método: POST
 * Endpoint: /:orderId/sku/:skuId
 * Parámetros:
 *  - orderId: ID del pedido al que se agregará el SKU
 *  - skuId: ID del SKU a agregar
 * Cuerpo de la solicitud:
 *  - quantity (opcional): Cantidad del SKU a agregar (por defecto 1)
 * Respuesta:
 *  - 200: Pedido actualizado exitosamente
 *  - 404: Pedido o SKU no encontrado
 *  - 500: Error interno del servidor
 */
router.post("/:orderId/sku/:skuId", async (req, res) => {
    try {
        const { orderId, skuId } = req.params; // Extrae orderId y skuId de los parámetros de la ruta
        const { quantity } = req.body; // Extrae quantity del cuerpo de la solicitud
        const updatedOrder = await orderManager.addSkuToOrder(orderId, skuId, quantity || 1); // Agrega el SKU al pedido
        res.status(200).json({ status: "success", payload: updatedOrder }); // Responde con el pedido actualizado
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para eliminar un pedido por su ID
 * Método: DELETE
 * Endpoint: /:id
 * Parámetros:
 *  - id: ID del pedido a eliminar
 * Respuesta:
 *  - 200: Pedido eliminado exitosamente
 *  - 404: Pedido no encontrado
 *  - 500: Error interno del servidor
 */
router.delete("/:id", async (req, res) => {
    try {
        await orderManager.deleteOneById(req.params.id); // Elimina el pedido por ID
        res.status(200).json({ status: "success" }); // Responde indicando éxito en la eliminación
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Exportación del router para ser utilizado en otras partes de la aplicación
export default router;

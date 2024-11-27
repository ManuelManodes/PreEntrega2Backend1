// Importaciones de módulos y clases necesarias
import { Router } from "express"; // Importa el Router de Express para definir rutas
import CartManager from "../managers/CartManager.js"; // Importa la clase CartManager para gestionar los carritos

// Inicialización del router y del gestor de carritos
const router = Router();
const cartManager = new CartManager();

/**
 * Ruta para crear un nuevo carrito
 * Método: POST
 * Endpoint: /
 * Respuesta:
 *  - 201: Carrito creado exitosamente
 *  - 500: Error interno del servidor
 */
router.post("/", async (req, res) => {
    try {
        const newCart = await cartManager.createCart(); // Crea un nuevo carrito
        res.status(201).json({ status: "success", payload: newCart }); // Responde con el carrito creado
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para obtener un carrito específico por su ID
 * Método: GET
 * Endpoint: /:cid
 * Parámetros:
 *  - cid: ID del carrito a obtener
 * Respuesta:
 *  - 200: Carrito obtenido exitosamente
 *  - 404: Carrito no encontrado
 *  - 500: Error interno del servidor
 */
router.get("/:cid", async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid); // Obtiene el carrito por ID
        res.status(200).json({ status: "success", payload: cart }); // Responde con el carrito obtenido
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para agregar un producto a un carrito específico
 * Método: POST
 * Endpoint: /:cid/product/:pid
 * Parámetros:
 *  - cid: ID del carrito al que se agregará el producto
 *  - pid: ID del producto a agregar
 * Respuesta:
 *  - 200: Producto agregado exitosamente al carrito
 *  - 404: Carrito o producto no encontrado
 *  - 500: Error interno del servidor
 */
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid); // Agrega el producto al carrito
        res.status(200).json({ status: "success", payload: updatedCart }); // Responde con el carrito actualizado
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Exportación del router para ser utilizado en otras partes de la aplicación
export default router;

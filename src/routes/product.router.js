// Importaciones de módulos y clases necesarias
import { Router } from "express"; // Importa el Router de Express para definir rutas
import ProductManager from "../managers/ProductManager.js"; // Importa la clase ProductManager para gestionar los productos

// Inicialización del router y del gestor de productos
const router = Router();
const productManager = new ProductManager();

/**
 * Ruta para obtener todos los productos
 * Método: GET
 * Endpoint: /
 * Query Parameters:
 *  - limit (opcional): Número máximo de productos a retornar
 * Respuesta:
 *  - 200: Lista de productos obtenida exitosamente
 *  - 500: Error interno del servidor
 */
router.get("/", async (req, res) => {
    try {
        const { limit } = req.query; // Captura el query parameter 'limit'
        const products = await productManager.getAll(limit); // Obtiene los productos con el límite especificado si existe
        res.status(200).json({ status: "success", payload: products }); // Responde con la lista de productos
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para obtener un producto específico por su ID
 * Método: GET
 * Endpoint: /:pid
 * Parámetros:
 *  - pid: ID del producto a obtener
 * Respuesta:
 *  - 200: Producto obtenido exitosamente
 *  - 404: Producto no encontrado
 *  - 500: Error interno del servidor
 */
router.get("/:pid", async (req, res) => {
    try {
        const product = await productManager.getOneById(req.params.pid); // Obtiene el producto por ID
        res.status(200).json({ status: "success", payload: product }); // Responde con el producto obtenido
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para crear un nuevo producto
 * Método: POST
 * Endpoint: /
 * Cuerpo de la solicitud (JSON):
 *  - title: Título del producto (string, obligatorio)
 *  - description: Descripción del producto (string, obligatorio)
 *  - code: Código único del producto (string, obligatorio)
 *  - price: Precio del producto (number, obligatorio)
 *  - status: Estado del producto (boolean, opcional, por defecto true)
 *  - stock: Cantidad en stock del producto (number, obligatorio)
 *  - category: Categoría del producto (string, obligatorio)
 *  - thumbnails: Lista de URLs de imágenes del producto (array de strings, opcional)
 * Respuesta:
 *  - 201: Producto creado exitosamente
 *  - 400: Faltan campos obligatorios
 *  - 500: Error interno del servidor
 */
router.post("/", async (req, res) => {
    try {
        const newProduct = await productManager.insertOne(req.body); // Crea un nuevo producto con los datos proporcionados
        res.status(201).json({ status: "success", payload: newProduct }); // Responde con el producto creado
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para actualizar un producto existente por su ID
 * Método: PUT
 * Endpoint: /:pid
 * Parámetros:
 *  - pid: ID del producto a actualizar
 * Cuerpo de la solicitud (JSON):
 *  - title: Nuevo título del producto (string, opcional)
 *  - description: Nueva descripción del producto (string, opcional)
 *  - code: Nuevo código único del producto (string, opcional)
 *  - price: Nuevo precio del producto (number, opcional)
 *  - status: Nuevo estado del producto (boolean, opcional)
 *  - stock: Nueva cantidad en stock del producto (number, opcional)
 *  - category: Nueva categoría del producto (string, opcional)
 *  - thumbnails: Nueva lista de URLs de imágenes del producto (array de strings, opcional)
 * Respuesta:
 *  - 200: Producto actualizado exitosamente
 *  - 404: Producto no encontrado
 *  - 500: Error interno del servidor
 */
router.put("/:pid", async (req, res) => {
    try {
        const updatedProduct = await productManager.updateOneById(req.params.pid, req.body); // Actualiza el producto por ID con los datos proporcionados
        res.status(200).json({ status: "success", payload: updatedProduct }); // Responde con el producto actualizado
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para eliminar un producto por su ID
 * Método: DELETE
 * Endpoint: /:pid
 * Parámetros:
 *  - pid: ID del producto a eliminar
 * Respuesta:
 *  - 200: Producto eliminado exitosamente
 *  - 404: Producto no encontrado
 *  - 500: Error interno del servidor
 */
router.delete("/:pid", async (req, res) => {
    try {
        await productManager.deleteOneById(req.params.pid); // Elimina el producto por ID
        res.status(200).json({ status: "success" }); // Responde indicando éxito en la eliminación
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Exportación del router para ser utilizado en otras partes de la aplicación
export default router;

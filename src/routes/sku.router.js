// Importaciones de módulos y clases necesarias
import { Router } from "express"; // Importa el Router de Express para definir rutas
import SkuManager from "../managers/SkuManager.js"; // Importa la clase SkuManager para gestionar los SKUs
import uploader from "../utils/uploader.js"; // Importa el middleware uploader para manejar la subida de archivos

// Inicialización del router y del gestor de SKUs
const router = Router();
const skuManager = new SkuManager();

/**
 * Ruta para obtener todos los SKUs
 * Método: GET
 * Endpoint: /
 * Respuesta:
 *  - 200: Lista de SKUs obtenida exitosamente
 *  - 500: Error interno del servidor
 */
router.get("/", async (req, res) => {
    try {
        const skus = await skuManager.getAll(); // Obtiene todos los SKUs
        res.status(200).json({ status: "success", payload: skus }); // Responde con la lista de SKUs
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para obtener un SKU específico por su ID
 * Método: GET
 * Endpoint: /:id
 * Parámetros:
 *  - id: ID del SKU a obtener
 * Respuesta:
 *  - 200: SKU obtenido exitosamente
 *  - 404: SKU no encontrado
 *  - 500: Error interno del servidor
 */
router.get("/:id", async (req, res) => {
    try {
        const sku = await skuManager.getOneById(req.params.id); // Obtiene el SKU por ID
        res.status(200).json({ status: "success", payload: sku }); // Responde con el SKU obtenido
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para crear un nuevo SKU, permite la subida de imágenes
 * Método: POST
 * Endpoint: /
 * Middleware:
 *  - uploader.single("file"): Maneja la subida de un solo archivo con el campo "file"
 * Cuerpo de la solicitud:
 *  - nombre_sku: Nombre del SKU (obligatorio)
 *  - precio: Precio del SKU (obligatorio)
 *  - disponibilidad: Disponibilidad del SKU (obligatorio, puede ser string o booleano)
 *  - file: Archivo de imagen asociado al SKU (opcional)
 * Respuesta:
 *  - 201: SKU creado exitosamente
 *  - 400: Faltan datos obligatorios
 *  - 500: Error interno del servidor
 */
router.post("/", uploader.single("file"), async (req, res) => {
    try {
        const sku = await skuManager.insertOne(req.body, req.file); // Crea un nuevo SKU con los datos proporcionados y el archivo subido
        res.status(201).json({ status: "success", payload: sku }); // Responde con el SKU creado
    } catch (error) {
        // Manejo de errores:
        // Si se subió un archivo y ocurre un error, elimina el archivo para evitar archivos huérfanos
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para actualizar un SKU por su ID, permite la subida de imágenes
 * Método: PUT
 * Endpoint: /:id
 * Middleware:
 *  - uploader.single("file"): Maneja la subida de un solo archivo con el campo "file"
 * Parámetros:
 *  - id: ID del SKU a actualizar
 * Cuerpo de la solicitud:
 *  - nombre_sku: Nuevo nombre del SKU (opcional)
 *  - precio: Nuevo precio del SKU (opcional)
 *  - disponibilidad: Nueva disponibilidad del SKU (opcional, puede ser string o booleano)
 *  - file: Nuevo archivo de imagen asociado al SKU (opcional)
 * Respuesta:
 *  - 200: SKU actualizado exitosamente
 *  - 404: SKU no encontrado
 *  - 500: Error interno del servidor
 */
router.put("/:id", uploader.single("file"), async (req, res) => {
    try {
        const sku = await skuManager.updateOneById(req.params.id, req.body, req.file); // Actualiza el SKU con los datos proporcionados y el nuevo archivo subido
        res.status(200).json({ status: "success", payload: sku }); // Responde con el SKU actualizado
    } catch (error) {
        // Manejo de errores:
        // Si se subió un archivo y ocurre un error, elimina el archivo para evitar archivos huérfanos
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

/**
 * Ruta para eliminar un SKU por su ID
 * Método: DELETE
 * Endpoint: /:id
 * Parámetros:
 *  - id: ID del SKU a eliminar
 * Respuesta:
 *  - 200: SKU eliminado exitosamente
 *  - 404: SKU no encontrado
 *  - 500: Error interno del servidor
 */
router.delete("/:id", async (req, res) => {
    try {
        await skuManager.deleteOneById(req.params.id); // Elimina el SKU por ID
        res.status(200).json({ status: "success" }); // Responde indicando éxito en la eliminación
    } catch (error) {
        // Manejo de errores: responde con el código de error especificado o 500 por defecto
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Exportación del router para ser utilizado en otras partes de la aplicación
export default router;

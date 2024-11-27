// Importaciones de módulos y utilidades necesarias
import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

// Definición de la clase OrderManager para gestionar las órdenes de compra
export default class OrderManager {
    // Propiedades privadas de la clase
    #jsonFilename;
    #orders;

    // Constructor de la clase
    constructor() {
        this.#jsonFilename = "orders.json"; // Archivo donde se almacenan las órdenes
    }

    /**
     * Método privado para encontrar una orden por su ID
     * @param {number|string} id - ID de la orden a buscar
     * @returns {object} - Orden encontrada
     * @throws {ErrorManager} - Si la orden no se encuentra
     */
    async #findOneById(id) {
        this.#orders = await this.getAll(); // Obtiene todas las órdenes
        const orderFound = this.#orders.find((item) => item.id === Number(id)); // Asegura que el ID sea numérico y busca la orden

        if (!orderFound) {
            throw new ErrorManager("ID no encontrado", 404); // Lanza error si no se encuentra la orden
        }

        return orderFound; // Retorna la orden encontrada
    }

    /**
     * Método para obtener todas las órdenes
     * @returns {Array} - Lista de todas las órdenes
     * @throws {ErrorManager} - Si hay un error al leer el archivo
     */
    async getAll() {
        try {
            this.#orders = await readJsonFile(paths.files, this.#jsonFilename); // Lee el archivo de órdenes
            return this.#orders; // Retorna la lista de órdenes
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si falla la lectura
        }
    }

    /**
     * Método para obtener una orden específica por su ID
     * @param {number|string} id - ID de la orden a obtener
     * @returns {object} - Orden encontrada
     * @throws {ErrorManager} - Si la orden no se encuentra o hay otro error
     */
    async getOneById(id) {
        try {
            const orderFound = await this.#findOneById(id); // Utiliza el método privado para encontrar la orden
            return orderFound; // Retorna la orden encontrada
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Propaga el error
        }
    }

    /**
     * Método para insertar una nueva orden
     * @param {object} data - Datos de la orden a insertar
     * @param {Array} data.sku_list - Lista de SKUs y cantidades
     * @param {string} data.cliente - Nombre del cliente
     * @param {string} data.fecha_pedido - Fecha del pedido
     * @returns {object} - Nueva orden creada
     * @throws {ErrorManager} - Si faltan datos obligatorios o hay otro error
     */
    async insertOne(data) {
        try {
            const { sku_list, cliente, fecha_pedido } = data; // Desestructura los datos de la orden

            // Verifica que todos los datos obligatorios estén presentes
            if (!sku_list || !cliente || !fecha_pedido) {
                throw new ErrorManager("Faltan datos obligatorios", 400); // Lanza error si faltan datos
            }

            // Crea la nueva orden con un ID único y formatea la lista de SKUs
            const order = {
                id: generateId(await this.getAll()), // Autogenera un ID único basado en las órdenes existentes
                sku_list: sku_list.map((item) => ({
                    sku: Number(item.sku), // Asegura que el SKU sea numérico
                    quantity: Number(item.quantity), // Asegura que la cantidad sea numérica
                })),
                cliente, // Asigna el nombre del cliente
                fecha_pedido, // Asigna la fecha del pedido
            };

            this.#orders.push(order); // Agrega la nueva orden a la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#orders); // Guarda las órdenes actualizadas en el archivo

            return order; // Retorna la nueva orden
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si ocurre alguno
        }
    }

    /**
     * Método para agregar un SKU a una orden específica
     * @param {number|string} orderId - ID de la orden
     * @param {number|string} skuId - ID del SKU a agregar
     * @param {number} [quantity=1] - Cantidad del SKU a agregar (por defecto 1)
     * @returns {object} - Orden actualizada
     * @throws {ErrorManager} - Si la orden no se encuentra o hay otro error
     */
    async addSkuToOrder(orderId, skuId, quantity = 1) {
        try {
            const orderFound = await this.#findOneById(orderId); // Busca la orden por ID
            const skuIndex = orderFound.sku_list.findIndex((item) => item.sku === Number(skuId)); // Busca el SKU en la lista

            if (skuIndex >= 0) {
                orderFound.sku_list[skuIndex].quantity += quantity; // Incrementa la cantidad si el SKU ya está
            } else {
                orderFound.sku_list.push({ sku: Number(skuId), quantity }); // Agrega el SKU con la cantidad especificada
            }

            const index = this.#orders.findIndex((item) => item.id === Number(orderId)); // Encuentra el índice de la orden en la lista
            this.#orders[index] = orderFound; // Actualiza la orden en la lista de órdenes
            await writeJsonFile(paths.files, this.#jsonFilename, this.#orders); // Guarda las órdenes actualizadas en el archivo

            return orderFound; // Retorna la orden actualizada
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si ocurre alguno
        }
    }
}

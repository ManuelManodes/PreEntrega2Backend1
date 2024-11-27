// Importaciones de módulos y utilidades necesarias
import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

// Definición de la clase ProductManager para gestionar los productos
export default class ProductManager {
    // Propiedades privadas de la clase
    #jsonFilename;
    #products;

    // Constructor de la clase
    constructor() {
        this.#jsonFilename = "products.json"; // Archivo donde se almacenan los productos
    }

    /**
     * Método privado para encontrar un producto por su ID
     * @param {number|string} id - ID del producto a buscar
     * @returns {object} - Producto encontrado
     * @throws {ErrorManager} - Si el producto no se encuentra
     */
    async #findOneById(id) {
        this.#products = await this.getAll(); // Obtiene todos los productos
        const productFound = this.#products.find((item) => item.id === Number(id)); // Asegura que el ID sea numérico y busca el producto

        if (!productFound) {
            throw new ErrorManager("ID producto no encontrado", 404); // Lanza error si no se encuentra el producto
        }

        return productFound; // Retorna el producto encontrado
    }

    /**
     * Método para obtener todos los productos
     * @param {number} [limit] - Número máximo de productos a retornar
     * @returns {Array} - Lista de productos, limitada si se especifica
     * @throws {ErrorManager} - Si hay un error al leer el archivo
     */
    async getAll(limit) {
        try {
            this.#products = await readJsonFile(paths.files, this.#jsonFilename); // Lee el archivo de productos
            return limit ? this.#products.slice(0, limit) : this.#products; // Retorna los productos limitados o todos
        } catch (error) {
            throw new ErrorManager("Error al obtener los productos", 500); // Lanza error si falla la lectura
        }
    }

    /**
     * Método para obtener un producto específico por su ID
     * @param {number|string} id - ID del producto a obtener
     * @returns {object} - Producto encontrado
     * @throws {ErrorManager} - Si el producto no se encuentra o hay otro error
     */
    async getOneById(id) {
        try {
            return await this.#findOneById(id); // Utiliza el método privado para encontrar el producto
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Propaga el error
        }
    }

    /**
     * Método para insertar un nuevo producto
     * @param {object} data - Datos del producto a insertar
     * @param {string} data.title - Título del producto
     * @param {string} data.description - Descripción del producto
     * @param {string} data.code - Código único del producto
     * @param {number} data.price - Precio del producto
     * @param {boolean} [data.status=true] - Estado del producto (activo/inactivo)
     * @param {number} data.stock - Cantidad en stock del producto
     * @param {string} data.category - Categoría del producto
     * @param {Array} [data.thumbnails=[]] - Lista de URLs de imágenes del producto
     * @returns {object} - Nuevo producto creado
     * @throws {ErrorManager} - Si faltan campos obligatorios o hay otro error
     */
    async insertOne(data) {
        try {
            const { title, description, code, price, status = true, stock, category, thumbnails = [] } = data; // Desestructura los datos del producto

            // Verifica que todos los campos obligatorios estén presentes
            if (!title || !description || !code || !price || stock === undefined || !category) {
                throw new ErrorManager("Faltan campos obligatorios", 400); // Lanza error si faltan campos
            }

            // Crea el nuevo producto con un ID único y formatea los datos
            const newProduct = {
                id: generateId(await this.getAll()), // Autogenera el ID único
                title, // Asigna el título del producto
                description, // Asigna la descripción del producto
                code, // Asigna el código único del producto
                price: Number(price), // Asegura que el precio sea numérico
                status: Boolean(status), // Asegura que el estado sea booleano
                stock: Number(stock), // Asegura que el stock sea numérico
                category, // Asigna la categoría del producto
                thumbnails: Array.isArray(thumbnails) ? thumbnails : [], // Asegura que las imágenes sean un arreglo
            };

            this.#products.push(newProduct); // Agrega el nuevo producto a la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products); // Guarda los productos actualizados en el archivo

            return newProduct; // Retorna el nuevo producto
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si ocurre alguno
        }
    }

    /**
     * Método para actualizar un producto existente por su ID
     * @param {number|string} id - ID del producto a actualizar
     * @param {object} data - Datos a actualizar del producto
     * @returns {object} - Producto actualizado
     * @throws {ErrorManager} - Si el producto no se encuentra o hay otro error
     */
    async updateOneById(id, data) {
        try {
            const productFound = await this.#findOneById(id); // Busca el producto por ID

            const updatedProduct = {
                ...productFound,
                ...data,
                id: productFound.id // Asegura que el ID no se modifica
            };

            const index = this.#products.findIndex((item) => item.id === Number(id)); // Encuentra el índice del producto en la lista

            // Validar que el índice es válido
            if (index === -1) {
                throw new ErrorManager("Producto no encontrado para actualizar", 404); // Lanza error si no se encuentra
            }

            this.#products[index] = updatedProduct; // Actualiza el producto en la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products); // Guarda los productos actualizados en el archivo

            return updatedProduct; // Retorna el producto actualizado
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si ocurre alguno
        }
    }

    /**
     * Método para eliminar un producto por su ID
     * @param {number|string} id - ID del producto a eliminar
     * @throws {ErrorManager} - Si el producto no se encuentra o hay otro error
     */
    async deleteOneById(id) {
        try {
            await this.#findOneById(id); // Verifica que el producto existe
            this.#products = this.#products.filter((item) => item.id !== Number(id)); // Filtra el producto de la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products); // Guarda los productos actualizados en el archivo
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si ocurre alguno
        }
    }
}

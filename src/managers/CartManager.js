// Importaciones de módulos y utilidades necesarias
import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";
import ProductManager from "./ProductManager.js"; // Importamos ProductManager para validar productos

// Definición de la clase CartManager para gestionar los carritos de compras
export default class CartManager {
    // Propiedades privadas de la clase
    #jsonFilename;
    #carts;

    // Constructor de la clase
    constructor() {
        this.#jsonFilename = "carts.json"; // Archivo donde se almacenan los carritos
    }

    /**
     * Método privado para encontrar un carrito por su ID
     * @param {number|string} id - ID del carrito a buscar
     * @returns {object} - Carrito encontrado
     * @throws {ErrorManager} - Si el carrito no se encuentra
     */
    async #findOneById(id) {
        this.#carts = await this.getAll(); // Obtiene todos los carritos
        const cartFound = this.#carts.find((item) => item.id === Number(id)); // Asegura que el ID sea numérico y busca el carrito
        if (!cartFound) {
            throw new ErrorManager("Carrito no encontrado", 404); // Lanza error si no se encuentra el carrito
        }
        return cartFound; // Retorna el carrito encontrado
    }

    /**
     * Método para obtener todos los carritos
     * @returns {Array} - Lista de todos los carritos
     * @throws {ErrorManager} - Si hay un error al leer el archivo
     */
    async getAll() {
        try {
            this.#carts = await readJsonFile(paths.files, this.#jsonFilename); // Lee el archivo de carritos
            return this.#carts; // Retorna la lista de carritos
        } catch (error) {
            throw new ErrorManager("Error al obtener los carritos", 500); // Lanza error si falla la lectura
        }
    }

    /**
     * Método para obtener un carrito específico por su ID
     * @param {number|string} id - ID del carrito a obtener
     * @returns {object} - Carrito encontrado
     * @throws {ErrorManager} - Si el carrito no se encuentra o hay otro error
     */
    async getCartById(id) {
        try {
            return await this.#findOneById(id); // Utiliza el método privado para encontrar el carrito
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Propaga el error
        }
    }

    /**
     * Método para crear un nuevo carrito
     * @returns {object} - Nuevo carrito creado
     * @throws {ErrorManager} - Si hay un error al crear el carrito
     */
    async createCart() {
        try {
            const newCart = {
                id: generateId(await this.getAll()), // Autogenera un ID único basado en los carritos existentes
                products: [], // Inicializa la lista de productos vacía
            };

            this.#carts.push(newCart); // Agrega el nuevo carrito a la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts); // Guarda los carritos actualizados en el archivo

            return newCart; // Retorna el nuevo carrito
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si ocurre alguno
        }
    }

    /**
     * Método para agregar un producto a un carrito específico
     * @param {number|string} cartId - ID del carrito
     * @param {number|string} productId - ID del producto a agregar
     * @returns {object} - Carrito actualizado
     * @throws {ErrorManager} - Si el producto no existe o hay otro error
     */
    async addProductToCart(cartId, productId) {
        try {
            // Validar que el producto existe
            const productExists = await new ProductManager().getOneById(productId);
            if (!productExists) {
                throw new ErrorManager("Producto no encontrado", 404); // Lanza error si el producto no existe
            }

            // Buscar el carrito por ID
            const cartFound = await this.#findOneById(cartId);

            // Verificar si el producto ya está en el carrito
            const productIndex = cartFound.products.findIndex((item) => item.product === productId);

            if (productIndex >= 0) {
                cartFound.products[productIndex].quantity += 1; // Incrementa la cantidad si el producto ya está
            } else {
                cartFound.products.push({ product: productId, quantity: 1 }); // Agrega el producto con cantidad 1
            }

            // Actualizar el carrito en la lista de carritos
            const index = this.#carts.findIndex((item) => item.id === Number(cartId));
            this.#carts[index] = cartFound;

            // Guardar los cambios en el archivo de carritos
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);

            return cartFound; // Retorna el carrito actualizado
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si ocurre alguno
        }
    }
}

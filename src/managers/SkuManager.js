// Importaciones de módulos y utilidades necesarias
import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile, deleteFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import { convertToBoolean } from "../utils/converter.js";
import ErrorManager from "./ErrorManager.js";

// Definición de la clase SkuManager para gestionar los SKUs
export default class SkuManager {
    // Propiedades privadas de la clase
    #jsonFilename;
    #skus;

    // Constructor de la clase
    constructor() {
        this.#jsonFilename = "sku.json"; // Archivo donde se almacenan los SKUs
    }

    /**
     * Método privado para encontrar un SKU por su ID
     * @param {number|string} id - ID del SKU a buscar
     * @returns {object} - SKU encontrado
     * @throws {ErrorManager} - Si el SKU no se encuentra
     */
    async #findOneById(id) {
        this.#skus = await this.getAll(); // Obtiene todos los SKUs
        const skuFound = this.#skus.find((item) => item.id === Number(id)); // Asegura que el ID sea numérico y busca el SKU

        if (!skuFound) {
            throw new ErrorManager("ID no encontrado", 404); // Lanza error si no se encuentra el SKU
        }

        return skuFound; // Retorna el SKU encontrado
    }

    /**
     * Método para obtener todos los SKUs
     * @returns {Array} - Lista de todos los SKUs
     * @throws {ErrorManager} - Si hay un error al leer el archivo
     */
    async getAll() {
        try {
            this.#skus = await readJsonFile(paths.files, this.#jsonFilename); // Lee el archivo de SKUs
            return this.#skus; // Retorna la lista de SKUs
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza error si falla la lectura
        }
    }

    /**
     * Método para obtener un SKU específico por su ID
     * @param {number|string} id - ID del SKU a obtener
     * @returns {object} - SKU encontrado
     * @throws {ErrorManager} - Si el SKU no se encuentra o hay otro error
     */
    async getOneById(id) {
        try {
            const skuFound = await this.#findOneById(id); // Utiliza el método privado para encontrar el SKU
            return skuFound; // Retorna el SKU encontrado
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Propaga el error
        }
    }

    /**
     * Método para insertar un nuevo SKU
     * @param {object} data - Datos del SKU a insertar
     * @param {string} data.nombre_sku - Nombre del SKU
     * @param {number} data.precio - Precio del SKU
     * @param {string|boolean} data.disponibilidad - Disponibilidad del SKU (puede ser string o booleano)
     * @param {object} [file] - Archivo de imagen asociado al SKU
     * @param {string} file.filename - Nombre del archivo de imagen
     * @returns {object} - Nuevo SKU creado
     * @throws {ErrorManager} - Si faltan datos obligatorios o hay otro error
     */
    async insertOne(data, file) {
        try {
            const { nombre_sku, precio, disponibilidad } = data; // Desestructura los datos del SKU

            // Verifica que todos los datos obligatorios estén presentes
            if (!nombre_sku || !precio || !disponibilidad) {
                throw new ErrorManager("Faltan datos obligatorios", 400); // Lanza error si faltan datos
            }

            // Crea el nuevo SKU con un ID único y formatea los datos
            const sku = {
                id: generateId(await this.getAll()), // Autogenera el ID único
                nombre_sku, // Asigna el nombre del SKU
                precio: Number(precio), // Asegura que el precio sea numérico
                disponibilidad: convertToBoolean(disponibilidad), // Convierte disponibilidad a booleano
                thumbnail: file?.filename, // Asigna el nombre del archivo de imagen si existe
            };

            this.#skus.push(sku); // Agrega el nuevo SKU a la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#skus); // Guarda los SKUs actualizados en el archivo

            return sku; // Retorna el nuevo SKU
        } catch (error) {
            // Si hay un archivo asociado y ocurre un error, elimina el archivo para evitar archivos huérfanos
            if (file?.filename) await deleteFile(paths.images, file.filename);
            throw new ErrorManager(error.message, error.code); // Lanza el error
        }
    }

    /**
     * Método para actualizar un SKU existente por su ID
     * @param {number|string} id - ID del SKU a actualizar
     * @param {object} data - Datos a actualizar del SKU
     * @param {string} [data.nombre_sku] - Nuevo nombre del SKU
     * @param {number} [data.precio] - Nuevo precio del SKU
     * @param {string|boolean} [data.disponibilidad] - Nueva disponibilidad del SKU
     * @param {object} [file] - Nuevo archivo de imagen asociado al SKU
     * @param {string} file.filename - Nombre del nuevo archivo de imagen
     * @returns {object} - SKU actualizado
     * @throws {ErrorManager} - Si el SKU no se encuentra o hay otro error
     */
    async updateOneById(id, data, file) {
        try {
            const { nombre_sku, precio, disponibilidad } = data; // Desestructura los datos a actualizar
            const skuFound = await this.#findOneById(id); // Busca el SKU por ID

            // Crea el objeto SKU actualizado combinando los datos existentes con los nuevos datos proporcionados
            const sku = {
                id: skuFound.id, // Asegura que el ID no se modifica
                nombre_sku: nombre_sku || skuFound.nombre_sku, // Actualiza el nombre si se proporciona
                precio: precio ? Number(precio) : skuFound.precio, // Actualiza el precio si se proporciona
                disponibilidad: disponibilidad ? convertToBoolean(disponibilidad) : skuFound.disponibilidad, // Actualiza la disponibilidad si se proporciona
                thumbnail: file?.filename || skuFound.thumbnail, // Actualiza el thumbnail si se proporciona un nuevo archivo
            };

            const index = this.#skus.findIndex((item) => item.id === Number(id)); // Encuentra el índice del SKU en la lista

            // Validar que el índice es válido
            if (index === -1) {
                throw new ErrorManager("ID no encontrado para actualizar", 404); // Lanza error si no se encuentra
            }

            this.#skus[index] = sku; // Actualiza el SKU en la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#skus); // Guarda los SKUs actualizados en el archivo

            // Si se proporciona un nuevo archivo y el thumbnail ha cambiado, elimina el archivo antiguo
            if (file?.filename && sku.thumbnail !== skuFound.thumbnail) {
                await deleteFile(paths.images, skuFound.thumbnail);
            }

            return sku; // Retorna el SKU actualizado
        } catch (error) {
            // Si hay un archivo nuevo y ocurre un error, elimina el archivo para evitar archivos huérfanos
            if (file?.filename) await deleteFile(paths.images, file.filename);
            throw new ErrorManager(error.message, error.code); // Lanza el error
        }
    }

    /**
     * Método para eliminar un SKU por su ID
     * @param {number|string} id - ID del SKU a eliminar
     * @throws {ErrorManager} - Si el SKU no se encuentra o hay otro error
     */
    async deleteOneById(id) {
        try {
            const skuFound = await this.#findOneById(id); // Busca el SKU por ID

            // Si el SKU tiene un thumbnail asociado, elimina el archivo de imagen
            if (skuFound.thumbnail) {
                await deleteFile(paths.images, skuFound.thumbnail);
            }

            const index = this.#skus.findIndex((item) => item.id === Number(id)); // Encuentra el índice del SKU en la lista
            this.#skus.splice(index, 1); // Elimina el SKU de la lista
            await writeJsonFile(paths.files, this.#jsonFilename, this.#skus); // Guarda los SKUs actualizados en el archivo
        } catch (error) {
            throw new ErrorManager(error.message, error.code); // Lanza el error
        }
    }
}

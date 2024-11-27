// Definición y exportación de la clase ErrorManager que extiende la clase nativa Error de JavaScript
export default class ErrorManager extends Error {
    /**
     * Constructor de la clase ErrorManager
     * @param {string} message - Mensaje de error descriptivo
     * @param {number} [code=500] - Código de estado HTTP asociado al error (por defecto 500)
     */
    constructor(message, code) {
        super(message); // Llama al constructor de la clase padre (Error) con el mensaje proporcionado
        this.code = code || 500; // Asigna el código de error proporcionado o usa 500 si no se especifica
    }
}

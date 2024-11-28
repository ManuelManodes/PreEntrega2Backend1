// Exporta una función llamada generateId que genera un nuevo ID basado en el ID máximo actual en una colección
export const generateId = (collection) => {
    // Imprime la colección en la consola para depuración
    console.log(collection);

    // Verifica si la colección no es un array válido
    if (!Array.isArray(collection)) {
        // Si no es un array, lanza un error con un mensaje específico
        throw new Error("Colección no válida");
    }

    // Inicializa una variable maxId en 0, que almacenará el ID más alto encontrado en la colección
    let maxId = 0;

    // Recorre cada elemento de la colección usando forEach
    collection.forEach((item) => {
        // Si el ID del elemento actual es mayor que maxId, actualiza maxId
        if (item.id > maxId) {
            maxId = item.id;
        }
    });

    // Devuelve el ID incrementado en 1, asegurándose de que sea único
    return maxId + 1;
};

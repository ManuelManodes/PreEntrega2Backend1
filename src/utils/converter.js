// Exporta una función llamada convertToBoolean que convierte un valor dado en un booleano
export const convertToBoolean = (value) => {
    // Define un array con los valores que se considerarán como "verdaderos" (true)
    const trueValues = [ "true", "on", "yes", "1", 1, true ];

    // Devuelve true si el valor proporcionado está incluido en el array de trueValues
    return trueValues.includes(value);
};

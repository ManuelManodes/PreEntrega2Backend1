// Obtiene el elemento del DOM con el ID "products-list" y lo asigna a la constante 'productsList'
// Este elemento será utilizado para mostrar la lista de productos en la interfaz
const productsList = document.getElementById("products-list");

// Obtiene el botón con el ID "btn-refresh-products-list" y lo asigna a la constante 'btnRefreshProductsList'
// Este botón permitirá al usuario actualizar la lista de productos manualmente
const btnRefreshProductsList = document.getElementById("btn-refresh-products-list");

/**
 * Función asíncrona para cargar la lista de productos desde la API
 */
const loadProductsList = async () => {
    try {
        // Realiza una solicitud GET a la API para obtener los productos
        const response = await fetch("/api/products", { method: "GET" });

        // Convierte la respuesta en formato JSON
        const data = await response.json();

        // Extrae el array de productos del campo 'payload' de la respuesta
        // Si 'payload' no existe, asigna un array vacío por defecto
        const products = data.payload || [];

        // Limpia el contenido actual de la lista de productos en la interfaz
        productsList.innerText = "";

        // Itera sobre cada producto y agrega un elemento <li> con la información del producto
        products.forEach(product => {
            productsList.innerHTML += `<li>Id: ${product.id} - Nombre: ${product.title}</li>`;
        });

    } catch (error) {
        // Maneja cualquier error que ocurra durante la solicitud o el procesamiento de datos
        console.error("Error al cargar la lista de productos:", error);
        productsList.innerText = "Error al cargar los productos.";
    }
};

// Añade un escuchador de eventos al botón de refrescar la lista de productos
// Cuando se hace clic en el botón, se ejecuta la función 'loadProductsList' y se registra un mensaje en la consola
btnRefreshProductsList.addEventListener("click", () => {
    loadProductsList(); // Carga la lista de productos actualizada
    console.log("Lista actualizada..."); // Registra en la consola que la lista ha sido actualizada
});

// Llama a la función 'loadProductsList' una vez al cargar el script para mostrar los productos inicialmente
loadProductsList();

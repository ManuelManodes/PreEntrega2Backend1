document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    const productsTableBody = document.querySelector("#products-table tbody");
    const productsForm = document.getElementById("products-form");
    const errorMessage = document.getElementById("error-message");

    socket.on("products-list", (data) => {
        const products = data.products || [];

        // Limpia el contenido actual del tbody
        productsTableBody.innerHTML = "";

        products.forEach((product) => {
            const row = document.createElement('tr');

            // Id
            const cellId = document.createElement('td');
            cellId.textContent = product.id;
            row.appendChild(cellId);

            // Nombre
            const cellTitle = document.createElement('td');
            cellTitle.textContent = product.title;
            row.appendChild(cellTitle);

            // Descripción
            const cellDescription = document.createElement('td');
            cellDescription.textContent = product.description;
            row.appendChild(cellDescription);

            // Código
            const cellCode = document.createElement('td');
            cellCode.textContent = product.code;
            row.appendChild(cellCode);

            // Precio
            const cellPrice = document.createElement('td');
            cellPrice.textContent = product.price;
            row.appendChild(cellPrice);

            // Stock
            const cellStock = document.createElement('td');
            cellStock.textContent = product.stock;
            row.appendChild(cellStock);

            // Categoría
            const cellCategory = document.createElement('td');
            cellCategory.textContent = product.category;
            row.appendChild(cellCategory);

            // Estado
            const cellStatus = document.createElement('td');
            cellStatus.textContent = product.status ? 'Activo' : 'Inactivo';
            row.appendChild(cellStatus);

            // Añade la fila al tbody
            productsTableBody.appendChild(row);
        });
    });

    productsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.target;
        const formdata = new FormData(form);

        errorMessage.innerText = "";
        form.reset();

        socket.emit("insert-product", {
            title: formdata.get("title"),
            description: formdata.get("description"),
            code: formdata.get("code"),
            price: formdata.get("price"),
            stock: formdata.get("stock"),
            category: formdata.get("category"),
            status: formdata.get("status") === "on" ? true : false,
            thumbnails: formdata.get("thumbnails").split(','), // Aunque no usamos las imágenes ahora, puede ser útil mantenerlo
        });
    });

    socket.on("error-message", (data) => {
        errorMessage.innerText = data.message;
    });
});

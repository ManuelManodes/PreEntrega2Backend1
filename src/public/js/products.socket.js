// public/js/products.socket.js

document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    // Selección de elementos del DOM
    const productsTableBody = document.querySelector("#products-table tbody");
    const productsForm = document.getElementById("products-form");
    const errorMessage = document.getElementById("error-message"); // Mensajes del formulario de ingreso
    const deleteErrorMessage = document.getElementById("delete-error-message"); // Mensajes del formulario de eliminación
    const inputProductId = document.getElementById("input-product-id");
    const btnDeleteProduct = document.getElementById("btn-delete-product");

    // Elementos del modal de confirmación
    const confirmDeleteModal = document.getElementById("confirm-delete-modal");
    const confirmDeleteYes = document.getElementById("confirm-delete-yes");
    const confirmDeleteNo = document.getElementById("confirm-delete-no");

    let productIdToDelete = null; // Variable para almacenar el ID del producto a eliminar

    /**
     * Función para abrir el modal de confirmación
     */
    const openModal = () => {
        confirmDeleteModal.style.display = "block";
        confirmDeleteYes.focus(); // Enfoca el botón "Sí" al abrir el modal
    };

    /**
     * Función para cerrar el modal de confirmación
     */
    const closeModal = () => {
        confirmDeleteModal.style.display = "none";
        btnDeleteProduct.focus(); // Devuelve el enfoque al botón de eliminar
    };

    /**
     * Manejar el envío del formulario de ingreso de productos
     */
    productsForm.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log("Formulario de productos enviado"); // Log de depuración
        const formData = new FormData(productsForm);

        // Limpia mensajes anteriores
        if (errorMessage) {
            errorMessage.innerText = "";
            errorMessage.style.color = "";
        }

        // Validación básica de campos (puedes extenderla según tus necesidades)
        const title = formData.get("title").trim();
        const description = formData.get("description").trim();
        const code = formData.get("code").trim();
        const price = parseFloat(formData.get("price"));
        const stock = parseInt(formData.get("stock"), 10);
        const category = formData.get("category").trim();
        const status = document.getElementById("status").checked;

        if (!title || !description || !code || isNaN(price) || isNaN(stock) || !category) {
            errorMessage.innerText = "Por favor, completa todos los campos correctamente.";
            errorMessage.style.color = "red";
            return;
        }

        // Envía los datos al servidor
        socket.emit("insert-product", {
            title,
            description,
            code,
            price,
            stock,
            category,
            status,
            // thumbnails: formData.get("thumbnails") ? formData.get("thumbnails").split(",") : [],
        });

        console.log("Evento 'insert-product' emitido"); // Log de depuración
    });

    /**
     * Evento para confirmar que el producto fue agregado
     */
    socket.on("product-inserted", (newProduct) => {
        if (errorMessage) {
            errorMessage.innerText = "Producto agregado correctamente.";
            errorMessage.style.color = "green"; // Mensaje de éxito
        }

        // Optimiza la inserción en el DOM usando Document Fragment
        const fragment = document.createDocumentFragment();
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${newProduct.id}</td>
            <td>${newProduct.title}</td>
            <td>${newProduct.description}</td>
            <td>${newProduct.code}</td>
            <td>${newProduct.price}</td>
            <td>${newProduct.stock}</td>
            <td>${newProduct.category}</td>
            <td>${newProduct.status ? 'Activo' : 'Inactivo'}</td>
        `;

        fragment.appendChild(row);
        productsTableBody.appendChild(fragment);

        // Resetear el formulario después de una inserción exitosa
        productsForm.reset();
    });

    /**
     * Manejar la eliminación de un producto con confirmación mediante modal
     */
    btnDeleteProduct.addEventListener("click", () => {
        const id = inputProductId.value.trim(); // Elimina espacios en blanco
        // Limpia mensajes anteriores
        if (errorMessage) {
            errorMessage.innerText = "";
            errorMessage.style.color = "";
        }
        if (deleteErrorMessage) {
            deleteErrorMessage.innerText = "";
            deleteErrorMessage.style.color = "";
        }

        if (id && parseInt(id, 10) > 0) {
            productIdToDelete = id; // Almacena el ID para usarlo tras la confirmación
            openModal(); // Abre el modal de confirmación
        } else {
            if (deleteErrorMessage) {
                deleteErrorMessage.innerText = "Por favor, ingresa un ID válido.";
                deleteErrorMessage.style.color = "red";
            }
        }
    });

    /**
     * Manejar la confirmación de eliminación (Sí)
     */
    confirmDeleteYes.addEventListener("click", () => {
        if (productIdToDelete) {
            socket.emit("delete-product", { id: productIdToDelete });
            // Limpia el campo después de la confirmación
            inputProductId.value = "";
            productIdToDelete = null;
            closeModal(); // Cierra el modal
        }
    });

    /**
     * Manejar la cancelación de eliminación (No)
     */
    confirmDeleteNo.addEventListener("click", () => {
        productIdToDelete = null;
        closeModal(); // Cierra el modal
    });

    /**
     * Cerrar el modal si el usuario hace clic fuera del contenido del modal
     */
    window.addEventListener("click", (event) => {
        if (event.target === confirmDeleteModal) {
            productIdToDelete = null;
            closeModal();
        }
    });

    /**
     * Confirmar que el producto fue eliminado
     */
    socket.on("product-deleted", (deletedProductId) => {
        if (deleteErrorMessage) {
            deleteErrorMessage.innerText = "Producto eliminado correctamente.";
            deleteErrorMessage.style.color = "green";
        }

        // Buscar y remover la fila correspondiente al producto eliminado
        const rowToDelete = Array.from(productsTableBody.rows).find(
            row => row.cells[0].textContent == deletedProductId
        );
        if (rowToDelete) {
            productsTableBody.removeChild(rowToDelete);
        }
    });

    /**
     * Manejar mensajes de error desde el servidor
     */
    socket.on("error-message", (data) => {
        if (data.context === "insert") { // Suponiendo que el servidor envía un contexto
            if (errorMessage) {
                errorMessage.innerText = data.message;
                errorMessage.style.color = "red";
            }
        } else if (data.context === "delete") {
            if (deleteErrorMessage) {
                deleteErrorMessage.innerText = data.message;
                deleteErrorMessage.style.color = "red";
            }
        } else { // General
            if (errorMessage) {
                errorMessage.innerText = data.message;
                errorMessage.style.color = "red";
            }
            if (deleteErrorMessage) {
                deleteErrorMessage.innerText = data.message;
                deleteErrorMessage.style.color = "red";
            }
        }
    });

    /**
     * Escuchar la lista inicial de productos (si es necesario)
     * Nota: Considera unificar este evento con 'products-list' para evitar redundancias
     */
    socket.on("initialProducts", (products) => {
        productsTableBody.innerHTML = ""; // Limpiar tabla

        const fragment = document.createDocumentFragment();

        products.forEach((product) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${product.description}</td>
                <td>${product.code}</td>
                <td>${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td>${product.status ? 'Activo' : 'Inactivo'}</td>
            `;
            fragment.appendChild(row);
        });

        productsTableBody.appendChild(fragment);
    });

    /**
     * Escuchar la lista de productos desde el servidor
     * Este evento puede ser utilizado para actualizar dinámicamente la lista de productos
     */
    socket.on("products-list", (data) => {
        const products = data.products || [];
        productsTableBody.innerHTML = ""; // Limpia el contenido actual del tbody

        const fragment = document.createDocumentFragment();

        products.forEach((product) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${product.description}</td>
                <td>${product.code}</td>
                <td>${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.category}</td>
                <td>${product.status ? 'Activo' : 'Inactivo'}</td>
            `;

            fragment.appendChild(row);
        });

        productsTableBody.appendChild(fragment);
    });
});

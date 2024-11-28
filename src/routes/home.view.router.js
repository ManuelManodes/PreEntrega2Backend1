// Importa el módulo Router de Express para manejar rutas en el servidor
import { Router } from "express";

// Crea una instancia de Router para definir y manejar rutas específicas
const router = Router();

// Define una ruta para el endpoint raíz ("/")
// Se utiliza el método HTTP GET para responder a las solicitudes
router.get("/", async (req, res) => {
    try {
        // Renderiza la vista "home" y pasa un objeto con un título para la plantilla
        res.render("home", { title: "Inicio" });
    } catch (error) {
        // Si ocurre un error, envía una respuesta con código 500 (error interno del servidor)
        // y un mensaje HTML con el error
        res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
    }
});

// Define otra ruta para el endpoint "/realTimeProducts"
// También utiliza el método HTTP GET
router.get("/realTimeProducts", async (req, res) => {
    try {
        // Renderiza la vista "realTimeProducts" con un título personalizado
        res.render("realTimeProducts", { title: "Productos en tiempo real" });
    } catch (error) {
        // Maneja errores de manera similar a la primera ruta
        res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
    }
});

// Exporta el enrutador para que pueda ser usado en otros archivos del proyecto
export default router;

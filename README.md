🚨 Municipalidad Valle del Sol - Frontend

Este repositorio contiene la interfaz web de la plataforma para la gestión y reporte de incendios forestales y urbanos en la comuna de Valle del Sol. La aplicación permite a los ciudadanos y autoridades visualizar focos de incendio en tiempo real y gestionar alertas de manera eficiente.  

🛠️ Tecnologías y HerramientasFramework: React.js con Vite para una compilación y despliegue de alto rendimiento.Estilos: Tailwind CSS para un diseño responsivo y moderno.Comunicación API: Axios para el consumo de microservicios a través del BFF.Mapa: Integración con Google Maps API para geolocalización en tiempo real.  Calidad de Código: Configuración de ESLint para mantener estándares de desarrollo profesional.

📁 Estructura del ProyectoSegún el estándar de este repositorio:/public: Activos estáticos, iconos de emergencia y recursos del sistema./src: Código fuente principal (componentes, servicios de conexión con Axios y lógica de mapas).tailwind.config.js: Definiciones de diseño y personalización visual.package.json: Lista de dependencias y scripts de ejecución (NPM).

🚀 Instrucciones de Instalación y Uso1. Requisitos PreviosTener instalado Node.js (v18 o superior).Contar con una Google Maps API Key válida.  

2. Configuración Clonar el repositorio y entrar a la carpeta:
git clone. "https://github.com/Baastian0922/valle-del-sol-frontend.git"
Entrar a la carpeta: cd valle-del-sol-frontend

3. Instalación de Dependencias
Ejecutar el comando de NPM para descargar los paquetes necesarios: npm install

4. Ejecución en Desarrollo
Para levantar el servidor local con Vite: NPM run dev
La aplicación estará disponible en http://localhost:5173.5.

5. Construcción para Producción
Para generar los archivos listos para despliegue: NPM run build

📋 Funcionalidades Implementadas 
Reporte Ciudadano: Formulario para el ingreso de alertas con descripción y multimedia. 
Mapa Interactivo: Visualización de focos activos mediante "pins" geográficos. 
Dashboard de Gestión: Panel para visualizar el estado de las emergencias (Activo, Controlado, Cerrado).  

Asignatura: Full Stack III   
Integrantes: Bastián Concha - Matias Neira   
Profesor: Johnnathan Rene Cubillos Flores   
Grupo: 10 

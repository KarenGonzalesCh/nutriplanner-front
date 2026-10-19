# NutriPlanner — Frontend

Frontend de **NutriPlanner**, aplicación de planificación alimentaria desarrollada para el TP de Programación II.

Desarrollado con React, TypeScript, Vite y Tailwind CSS.

## 1. Requisitos previos

Tener instalados:

- [Git](https://git-scm.com/downloads)
- [Node.js (LTS)](https://nodejs.org/) — incluye npm.
- [Visual Studio Code](https://code.visualstudio.com/)

## 2. Clonar el repositorio

Abrir una terminal y ejecutar:

```bash
git clone https://github.com/sxlvtti/nutriplanner-front.git
cd nutriplanner-front
```

## 3. Instalar dependencias

Desde la carpeta del proyecto:

```bash
npm install
```

## 4. Ejecutar el frontend

```bash
npm run dev
```

Abrir en el navegador la dirección que aparece en la terminal (generalmente `http://localhost:5173`).

Para detener el servidor, presionar `Ctrl + C`.

## 5. Actualizar el proyecto

Para descargar los últimos cambios de GitHub:

```bash
git switch main
git pull origin main
```

Luego ejecutar `npm install` si cambiaron las dependencias.

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Ejecutar la aplicación |
| `npm run build` | Compilar el proyecto |
| `npm run test` | Ejecutar pruebas |

## Backend

El backend está desarrollado con Python y FastAPI.

[Repositorio del backend](https://github.com/KarenGonzalesCh/nutriplanner-api)

**Nota:** actualmente el frontend utiliza datos simulados, por lo que puede ejecutarse sin iniciar el backend.

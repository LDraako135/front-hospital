# 📘 Frontend -- Hospital Device Management UI

Este proyecto es el **frontend del sistema hospitalario de gestión de
dispositivos**, incluyendo computadoras, dispositivos médicos y equipos
ingresados. Proporciona una interfaz clara, responsiva y fácil de usar
que se comunica directamente con el backend construido en Elysia + Bun.

------------------------------------------------------------------------

## 1. 🌐 URL de la página

 ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.4:5173/
  ➜  Network: http://172.29.160.1:5173/
------------------------------------------------------------------------

## 2. 📖 Descripción del proyecto

El objetivo del proyecto es permitir al personal hospitalario registrar,
consultar y gestionar dispositivos que ingresan o salen del hospital.\
El sistema ofrece funcionalidades como check-in, checkout, gestión de
computadoras frecuentes y visualización de detalles de cada equipo.

### Tecnologías y librerías usadas

-   React con TypeScript\
-   Vite\
-   Material Web (MD3)\
-   Axios / Fetch\
-   React Router\
-   Estilos CSS modularizados\
-   Bun (runtime)

------------------------------------------------------------------------

## 3. 📁 Estructura del proyecto

    public/
    src/
    ├── assets/
    ├── components/
    │   ├── BottomNav.css
    │   ├── BottomNav.tsx
    │   ├── ImageUploadPreview.tsx
    │   └── ui.tsx
    ├── lib/
    │   ├── api.ts
    │   └── auth-client.ts
    ├── md3/
    ├── pages/
    │   ├── auth/
    │   ├── computersChekin/
    │   │   ├── computersChekin.css
    │   │   └── computersChekin.tsx
    │   ├── deviceDetail/
    │   │   ├── deviceDetail.css
    │   │   └── deviceDetail.tsx
    │   ├── enteredDevices/
    │   │   ├── enteredDevices.css
    │   │   └── enteredDevices.tsx
    │   ├── frequentComputers/
    │   │   ├── frequentComputers.css
    │   │   └── frequentComputers.tsx
    │   ├── medicalDeviceChekin/
    │   ├── NotFound.css
    │   └── NotFound.tsx
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    └── material-web.d.ts

    .env
    .env.example
    dockerfile
    package.json
    package-lock.json
    eslint.config.js
    index.html

------------------------------------------------------------------------

## 4. 📂 Explicación de carpetas

### **assets/**

Imágenes, íconos u otros archivos estáticos utilizados en la interfaz.

### **components/**

Componentes reutilizables del sistema.\
Incluye: - **BottomNav**: navegación inferior tipo aplicación móvil.\
- **ImageUploadPreview**: componente de subida y vista previa de
imágenes.\
- **ui.tsx**: componentes globales reutilizables.

### **lib/**

Lógica central del frontend: - **api.ts**: funciones de comunicación con
la API backend. - **auth-client.ts**: autenticación y manejo de sesión.

### **pages/**

Cada carpeta representa una vista/pantalla del sistema: -
**computersChekin** → check-in de computadoras. - **deviceDetail** →
detalles de un dispositivo. - **enteredDevices** → dispositivos
ingresados. - **frequentComputers** → computadoras frecuentes. -
**medicalDeviceChekin** → check-in de dispositivos médicos. - **auth** →
login/autenticación. - **NotFound** → página 404.

### **md3/**

Configuración y componentes extendidos de Material Design 3.

### **App.tsx / main.tsx**

Punto de entrada principal de la aplicación.

------------------------------------------------------------------------

## 5. ⚙️ Configuración y entorno

El archivo `.env` controla la dirección del backend:

    VITE_API_URL=http://localhost:3000

`.env.example` sirve como plantilla para nuevos entornos.

------------------------------------------------------------------------

## 6. ▶️ Cómo ejecutar el proyecto

### 🧪 Desarrollo

1.  Clona el repositorio\
2.  Instala dependencias\

``` bash
bun install
# o
npm install
```

3.  Crea tu archivo `.env` desde `.env.example`
4.  Inicia el servidor:

``` bash
bun run dev
# o
npm run dev
```

5.  Abre en el navegador:

```{=html}
<!-- -->
```
    http://localhost:5173

### 🚀 Producción

``` bash
npm run build
npm run preview
```

### 🐳 Docker

``` bash
docker build -t front-hospital .
docker run -p 5173:5173 front-hospital
```

------------------------------------------------------------------------

## 7. 📡 Endpoints consumidos

  ----------------------------------------------------------------------------------------------
  Módulo           Método           Ruta                              Descripción
  ---------------- ---------------- --------------------------------- --------------------------
  Devices          GET              /devices/entered                  Ver dispositivos
                                                                      ingresados

  Devices          DELETE           /devices/:id/checkout             Checkout

  Computers        GET              /computers                        Listar computadoras

  Computers        POST             /computers/checkin                Check-in normal

  Frequent         GET              /computers/frequent               Listar frecuentes

  Frequent         POST             /computers/frequent/register      Registrar frecuente

  Frequent         POST             /computers/frequent/:id/checkin   Check-in rápido

  Medical          POST             /medical-devices/checkin          Check-in dispositivo
                                                                      médico
  ----------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 8. 🏗️ Arquitectura del proyecto

### Diagrama general (descriptivo)

    UI Components
          ↓
    Pages (views)
          ↓
    Hooks / Stores
          ↓
    lib/api.ts  →  Backend (Elysia + Bun)

Si deseas, puedo generar un **UML completo en PDF o imagen**.

------------------------------------------------------------------------

## ✔️ Estado del proyecto

Sistema funcionando correctamente con integración al backend
hospitalario.

------------------------------------------------------------------------

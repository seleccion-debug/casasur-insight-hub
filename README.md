# Hotel Insights Unified

Por favor, aplica las siguientes correcciones en la aplicación respetando exactamente estas indicaciones:
1. LÓGICA DE REPORTES CORPORATIVOS (POR SECTOR INDEPENDIENTE DEL HOTEL):
   - Para los sectores "Administración", "RRHH", "Comercial" y "Gerencia", los reportes por sector deben consolidar y mostrar TODAS las respuestas de ese sector sin importar qué hotel se haya seleccionado (Recoleta, Palermo, Bellini o Hotel Collection).
   - Elimina cualquier filtro que impida mostrar respuestas en estos 4 reportes sectoriales.
2. UBICACIÓN FIJA DE LOGOS:
   - En el HEADER (cabecera superior) de toda la aplicación (tanto en /encuesta como en /admin): Muestra SIEMPRE el Logo Circular C/S.
   - En el FOOTER (pie de página) de toda la aplicación: Muestra SIEMPRE el Logo Horizontal Tipográfico ('CASASUR Hotel Collection®').
   - Si no existen las imágenes en public/, renderiza como fallback elegante el texto con tipografía Serif 'CASASUR'.
3. ACTUALIZACIÓN DE DROPDOWNS EN /encuesta:
   - En el desplegable de "Hotel", las únicas 4 opciones válidas son:
     1. "Recoleta"
     2. "Palermo"
     3. "Bellini"
     4. "Hotel Collection (Comercial, RRHH, Administracion, Gerencia)"
 
4. UNIFICACIÓN FRONT + SEGURIDAD:
   - En los reportes de Front / Recepción de cada hotel, incluye y suma automáticamente los datos del sector "Seguridad" (del hotel en el que correspndan)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://casasur-insight-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e2f7e61a-9dac-4348-8a83-068ed35b97bc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

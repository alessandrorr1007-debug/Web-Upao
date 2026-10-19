========================================================================
CARPETA DE DESCARGAS DE LA APLICACIÓN UPAO S
========================================================================

Esta carpeta contiene el archivo APK que los usuarios descargarán desde la landing page.

1. ARCHIVO PRINCIPAL REQUERIDO:
   - Nombre esperado: "app.apk"
   - Ruta completa: /downloads/app.apk
   - Enlace en la web: <a href="downloads/app.apk" download="UPAO-S-v1.7.1.apk">

2. CÓMO ACTUALIZAR EL APK:
   - Cuando compiles una nueva versión release firmada en Android Studio:
     Ruta de origen:
     D:\Proyectos\UPAO PROC\UPAO S\app\build\outputs\apk\release\UPAO-S-<version>.apk
   - Copia o renombra dicho archivo aquí como:
     "app.apk"
   - Si cambias la versión en la app (por ejemplo v1.7.2), recuerda también
     actualizar la etiqueta de versión en index.html.

3. CONFIGURACIÓN EN NETLIFY (netlify.toml):
   El archivo netlify.toml en la raíz del proyecto ya está configurado con:
   [[headers]]
     for = "/downloads/*.apk"
     [headers.values]
       Content-Type = "application/vnd.android.package-archive"
       Content-Disposition = "attachment"

========================================================================

# Deployment

Para desplegar los cambios en el servidor de AWS se deben realizar los siguientes pasos:

1. Descargar e instalar Git en tu equipo [https://git-scm.com/downloads]

2. Clonar el repositorio del proyecto **frontclient** a tu equipo

3. Añadir la llave **PEM** al sshconfig de tu equipo

4. Establecer como un host conocido a la IP **3.141.46.148**

5. Abrir un terminal y dirigirte a la carpeta del proyecto del **frontclient**

6. Para añadir al repositorio local el acceso remoto al servidor de AWS, ejecutar el siguiente comando en la terminal::
  ```
  git remote add live ubuntu@3.141.46.148:repositories/frontend.git
  ```

7. Para verificar que se haya añadido correctamente el acceso remoto, ejecutar el siguiente comando en la terminal:
  ```
  git remote show live
  ```

8. Para actualizar los cambios del servidor en el repositorio local con todas sus ramas, ejecutar el siguiente comando en la terminal:
  ```
  git fetch --all
  ```
  ```
  git pull -v
  ```

9. Moverse a la rama **stage** en local, ejecutar el siguiente comando en la terminal:
  ```
  git checkout stage
  ```

10. Unificar los cambios dentro de la rama **develop** a **stage**, ejecutar el siguiente comando en la terminal:
  ```
  git merge develop
  ```

11. Actualizar los cambios al servidor de AWS, ejecutar el siguiente comando en la terminal:
  ```
  git push live stage
  ```

Con estos pasos ya se verán reflejados los cambios en el servidor de forma inmediata.

# Instrucciones para agregar archivos a las galerías de fotos/videos

## Requisitos

- Los pasos se tienen que ejecutar para cada mes individualmente.
- Antes de ejecutar cada script, abrirlo y revisar el contenido, hay algunas instrucciones y variables para cambiar

## Pasos

1 - Copiar las imágenes que vamos a procesar en `temp_images`
2 - Configurar `images_optimizer.sh` para generar los archivos optimizados para web en la carpeta correspondiente
3 - Ejecutar `./images_optimizer.sh` para genera los archivos
4 - El comando anterior va a crear la carpeta configurada (debería ser `/media/meetups/<year>_<month>`), copiar los videos dentro de esa carpeta
5 - Configurar `process_videos.sh` para apuntar a la nueva carpeta creada por `images_optimizer.sh`
6 - Ejecutar `./process_videos.sh` para generar las miniaturas de los videos
7 - Configurar `generate_json.rb` para apuntar a la nueva carpeta creada por `images_optimizer.sh`
8 - Ejecutar `ruby generate_json.rb` para generar un array JSON con los datos de las imagenes y videos para agregar al sitio
9 - Actualizar `_data/gallery.json` agregando el nuevo contenido
10 - Opcional: agregar textos alternativos para las imágenes y videos

## TODO

Automatizar todos esos pasos con algún script, adaptando los distintos scripts para aceptar argumentos.

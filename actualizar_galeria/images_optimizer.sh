#!/bin/bash

# Script para optimizar imágenes para la web

# 0 - Instalar imagemagick y webp (por ejemplo: `sudo apt install imagemagick webp`)
# 1 - Copiar las imágenes originales en una carpeta que temporal y configurarla en INPUT_DIR
# 2 - Editar OUTPUT_DIR para apuntar a la carpeta `<año>_<mes>` donde se van a guardar las variantes
# 3 - En el root del proyecto, ejecutar el script `./images_optimizer.sh`

# <Configuracion>
# path relativo al directorio del repositorio
INPUT_DIR="temp_images"

# cambiar para guardar fotos de otro mes
FECHA_MEETUP="2025_07"

# </Configuracion>

readonly CURRENT_DIR=$(dirname "$0")
readonly ROOT_FOLDER=$(realpath "${CURRENT_DIR}/..")
readonly INPUT_DIR="${ROOT_FOLDER}/${INPUT_DIR}"
readonly OUTPUT_DIR="${ROOT_FOLDER}/media/meetups/${FECHA_MEETUP}"

# Tamaños de las imagenes.
# Estos tamaños son fijos porque son parte del path de la imagen
# ver: js/app.js
readonly SIZES=(1280 768 480)

mkdir -p "$OUTPUT_DIR"

# Genera JPG 85% y webp para cada imagen
optimize_image() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name="${filename%.*}"
    local ext="${filename##*.}"
    local thumbnail_size=120

    for size in "${SIZES[@]}"; do
        convert "$input_file" -resize "${size}x" -quality 85 "$OUTPUT_DIR/${name}-${size}.jpg"

        convert "$input_file" -resize "${thumbnail_size}x" -quality 85 "$OUTPUT_DIR/${name}_thumbnail.jpg"
        
        cwebp -q 85 "$OUTPUT_DIR/${name}-${size}.jpg" -o "$OUTPUT_DIR/${name}-${size}.webp"
    done
}

# editar esta línea si los archivos originales tienen otras extensiones
for file in "$INPUT_DIR"/*.{jpg,jpeg,png,HEIC}; do
    [ -e "$file" ] || continue
    echo "Procesando $file..."
    optimize_image "$file"
done

echo "Listo. Archivos generados en '$OUTPUT_DIR'."

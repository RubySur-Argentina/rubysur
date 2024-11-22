#!/bin/bash

# Script para convertir MOV a mp4 y generar thumbnails de los videos para la web

# 0 - Instalar ffmpeg e imagemagick (por ejemplo: `sudo apt install ffmpeg imagemagick`)
# 1 - Copiar los videos en la carpeta del mes y configurarla en INPUT_DIR
# 3 - En el root del proyecto, ejecutar el script `./process_videos.sh`
# 4 - NO incluir los .MOV al hacer commit

# > Los videos tienen que ser mp4, si tenemos videos en otros formatos también tenemos que convertirlos, no sólo los .mov

INPUT_DIR="../media/meetups/2024_09"

mov_to_mp4() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name="${filename%.*}"

    ffmpeg -i "$input_file" -c:v libx264 -c:a aac -strict experimental -b:a 192k -movflags +faststart "$INPUT_DIR/${name}.mp4"
}

for file in "$INPUT_DIR"/*.MOV; do
    echo "$file"
    [ -e "$file" ] || continue
    echo "Procesando $file..."
    mov_to_mp4 "$file"
done

generate_thumbnail() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name="${filename%.*}"
    local thumbnail_size=120

    # saco un frame como jpg
    ffmpeg -y -ss 0.1 -i "$input_file" -vframes 1 -q:v 2 "$INPUT_DIR/${name}_thumbnail.jpg"

    # resize a tamaño thumbnail
    convert "$INPUT_DIR/${name}_thumbnail.jpg" -resize "${thumbnail_size}x" -quality 85 "$INPUT_DIR/${name}_thumbnail.jpg"
}

for file in "$INPUT_DIR"/*.mp4; do
    echo "$file"
    [ -e "$file" ] || continue
    echo "Procesando $file..."
    generate_thumbnail "$file"
done

echo "Listo. Miniaturas generadas en '$INPUT_DIR'."

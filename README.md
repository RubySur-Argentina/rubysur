# rubysur

Sitio de RubySur Argentina

## Setup

### Con Docker

Requisitos:

- Docker y Docker Compose

Setup:

- `docker compose up`
- Abrir `localhost:4000` en el navegador

### Sin Docker

Requisitos:

- Ruby 3.3.4
- bundler 2.5.17

> Si se actualiza esto, actualizar los valores en `Dockerfile` y `.github/jekyll.yml` también

Setup:

- `bundle install`
- `bundle exec jekyll serve --livereload`
- Abrir `localhost:4000` en el navegador

> Ambos métodos (con y sin Docker) soportan live auto reload al cambiar código

## Troubleshoot

- Si el server no inicia sin docker luego de usar docker, borrar la carpeta `.jekyll-cache`

## Copyright

- Íconos de redes y ubicación: Fontawesome https://fontawesome.com

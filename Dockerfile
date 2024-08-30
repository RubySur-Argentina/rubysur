# Use the Ruby image from Docker Hub (https://hub.docker.com/_/ruby)
FROM ruby:3.3.4

# So we can debug code modify rails code inside the container
RUN apt update && apt install -y vim && rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY Gemfile ./
COPY Gemfile.lock ./

RUN gem install bundler -v "2.5.17"

RUN bundle install

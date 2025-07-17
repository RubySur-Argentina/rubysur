#!/usr/bin/env ruby
require "json"

IMAGE_EXTENSIONS = [".jpg", ".webp"]
VIDEO_EXTENSIONS = [".mp4", ".mov"]

INPUT_DIR = "../media/meetups/2025_07/"

JSON_ARRAY = []

def process_video_file(file)
  extension = File.extname(file)
  filename = file.gsub(INPUT_DIR, "").gsub(extension, "")

  JSON_ARRAY << {
    filename: filename,
    media_type: "video",
    alt_text: ""
  }
end

def process_image_file(file)
  # ignoro thumbnails y proceso una sola variante de cada imagen
  return if !file.include?("-480.jpg")

  filename = file.gsub(INPUT_DIR, "").gsub("-480.jpg", "")

  JSON_ARRAY << {
    filename: filename,
    media_type: "image",
    alt_text: ""
  }
end

Dir["#{INPUT_DIR}**/*"].each do |file|
  extension = File.extname(file).downcase
  if IMAGE_EXTENSIONS.include?(extension)
    next if file.include?("_thumbnail")
    process_image_file(file)
  elsif VIDEO_EXTENSIONS.include?(extension)
    process_video_file(file)
  end
end

puts JSON.dump(JSON_ARRAY)

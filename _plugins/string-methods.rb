module StringMethods
  def description_with_br(input)
    return input if input.is_a?(String)

    input.join('<br><br>') if input.is_a?(Array)
  end

  def descriptions_for_calendar_event(talks)
    talks.map do |t|
      [
        t['title'],
        description_for_calendar_event(t['description_highlighted'])
      ].join('\n')
    end.join('\n\n').gsub('"', '%22').gsub(' ', '+').gsub('\n', '%0A%0A')
  end

  def description_for_calendar_event(input)
    return input if input.is_a?(String)

    input.join('\n') if input.is_a?(Array)
  end
end

Liquid::Template.register_filter(StringMethods)
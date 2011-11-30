class AdminListPage < RecordProxyPage
  # respond_to :get do
  #   with :html do
  #     return unless user_allowed_to?(:view)
  #     
  #     if params['record_id']
  #       record = site.records.find(BSON::ObjectId.from_string(params['record_id']))
  #       if record
  #         layout = site.layouts.where(name: "admin_#{modelling.name.downcase.underscore}").first
  #         if layout
  #           layout.render(record)
  #         else
  #           record.name
  #         end
  #       end
  #     elsif params['search']
  #       render_list_items
  #     else
  #       render_or_default(:html) do
  #         "<p>Sorry, a layout couldn't be found for this page</p>" # FIXME: better error message
  #       end
  #     end
  #   end
  # end
  # 
  # 
  # def records
  #   query = modelling.where()
  #   
  #   if params['search']
  #     keywords = params['search'].split(' ').reject(&:blank?).collect(&:downcase)
  #     query = query.where(search_keywords: keywords) unless keywords.blank?
  #   end
  #   
  #   query.all
  # end
  # 
  # 
  # def render_list_items
  #   layout = site.layouts.where(name: "admin_list_items").first
  #   if layout
  #     layout.render(self)
  #   end
  # end
  # 
  
  def render_value(record, column)
    raw_value = record.get(column.name)
    value = ''
    
    case column.style
    when 'Text'
      value = raw_value
      
    when 'Integer'
      raw_value = raw_value.to_i
      value = raw_value
      
    when 'Float'
      raw_value = raw_value.to_f
      value = raw_value.round(column.decimals)
      
    when 'Currency'
      raw_value = raw_value.to_f
      value = "#{symbol}#{raw_value.round(column.decimals)}"
      
    when 'Percentage'
      raw_value = raw_value.to_f
      value = "#{raw_value.round(column.decimals)}%"
      
    when 'Date'
      if column.format
        value = raw_value.strftime(column.format)
      else
        value = raw_value.strftime('%F')
      end
      raw_value = raw_value.strftime('%F %T')
      
    when 'Time'
      if column.format
        value = raw_value.strftime(column.format)
      else
        value = raw_value.strftime('%R')
      end
      raw_value = raw_value.strftime('%T')
      
    when 'DateTime'
      if column.format
        value = raw_value.strftime(column.format)
      else
        value = raw_value.strftime('%F %R')
      end
      raw_value = raw_value.strftime('%F %T')
      
    when 'Label'
      label_color = column.colors.find {|label_color| label_color.label == raw_value}
      value = "<span style='background-color: ##{label_color.try(:color)}'>#{raw_value}</span>"
    end
    
    "<td data-value='#{raw_value}'>#{value}</td>"
  end
  
  def render_record(record)
    cells = columns.collect {|column| render_value(record, column)}.join
    "<tr data-record-id='#{record.id}'>#{cells}</tr>"
  end
  
  def parser_for_column(column)
    case column.style
    when 'Text'
      'text'
    when 'Integer'
      'digit'
    when 'Float'
      'digit'
    when 'Currency'
      'digit'
    when 'Percentage'
      'digit'
    when 'Date'
      'isoDate'
    when 'Time'
      'time'
    when 'DateTime'
      'isoDate'
    when 'Label'
      'text'
    end
  end
  
  def sort_list
    columns.each_with_index do |column, index|
      return "[[#{index}, 0]]" if column.default_sort
    end
    "[[0, 0]]"
  end
  
  def format_record(record)
    {record: record, name: record.name, '_row_html' => render_record(record)}
  end
end

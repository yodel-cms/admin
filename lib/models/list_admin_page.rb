class ListAdminPage < AdminPage
  
  respond_to :get do
    with :html do
      return unless user_allowed_to?(:view)
      
      if params['record_id']
        record = site.records.find(BSON::ObjectId.from_string(params['record_id']))
        if record
          layout = site.layouts.where(name: "admin_#{modelling.name.downcase.underscore}").first
          if layout
            layout.render(record)
          else
            record.name
          end
        end
      elsif params['search']
        render_list_items
      else
        render_or_default(:html) do
          "<p>Sorry, a layout couldn't be found for this page</p>" # FIXME: better error message
        end
      end
    end
  end
  
  
  def records
    query = modelling.where()
    
    if group_by
      if modelling.record_fields[group_by].is_a?(TimeField) || modelling.record_fields[group_by].is_a?(DateField)
        query = query.sort("#{group_by} desc")
      else
        query = query.sort(group_by)
      end
    end
    
    if params['search']
      keywords = params['search'].split(' ').reject(&:blank?).collect(&:downcase)
      query = query.where(search_keywords: keywords) unless keywords.blank?
    end
    
    query.all
  end
  
  
  def render_list_items
    layout = site.layouts.where(name: "admin_list_items").first
    if layout
      layout.render(self)
    end
  end
  
end

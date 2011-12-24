class AdminTreePage < Page
  # ---------------------------
  # show
  # ---------------------------
  respond_to :get do
    with :html do
      return unless user_allowed_to?(:view)
      case params['action']
      # render the main page
      when nil
        @record = root
        layout('html', false).render(self)
      
      # show a single record
      when 'show'
        @record = site.records.find(BSON::ObjectId.from_string(params['id']))
        render_layout('admin_record_form', 'html')
      
      # show a blank form for a new record
      when 'new'
        model = site.models.find(BSON::ObjectId.from_string(params['model']))
        parent = site.records.find(BSON::ObjectId.from_string(params['parent']))
        @record = model.new
        @record.parent = parent
        render_layout('admin_record_form', 'html')
      end
    end
    
    # render a record tree in json
    with :json do
      status 404 and return {} if root.nil?
      if params['id']
        record = site.records.find(BSON::ObjectId.from_string(params['id']))
        tree_for(record, true)
      else
        tree_for(root, true)
      end
    end
  end
  
  
  # ---------------------------
  # delete
  # ---------------------------
  respond_to :delete do
    with :json do
      record = site.records.find(BSON::ObjectId.from_string(params['id']))
      record.destroy
      {success: true}
    end
  end
  
  
  # ---------------------------
  # update
  # ---------------------------
  respond_to :put do
    with :json do
      record = site.records.find(BSON::ObjectId.from_string(params['id']))
      
      case params['action']
      # udpate the record
      when nil
        if params.key?('record')
          values = JSON.parse(params['record'])
        else
          values = params
        end
      
        if record.from_json(values)
          {success: true, record: json_for_record(record, false, []).merge({values: record.to_json})}
        else
          {success: false, errors: record.errors}
        end
      
      # change the index of an existing record
      when 'set_index'
        record.insert_in_siblings(params['index'].to_i)
        if record.save
          {success: true}
        else
          {success: false}
        end
      end
    end
  end
  
  
  # ---------------------------
  # create
  # ---------------------------
  respond_to :post do
    with :json do
      # FIXME: this is copied from page.rb - should be extracted
      model = site.models.find(BSON::ObjectId.from_string(params.delete('model')))
      parent = site.records.find(BSON::ObjectId.from_string(params.delete('parent')))
      new_record = model.new
      new_record.parent = parent
      
      if params.key?('record')
        values = JSON.parse(params['record'])
      else
        values = params
      end
      
      if new_record.from_json(values)
        {success: true, record: json_for_record(new_record, false, []).merge({values: new_record.to_json})}
      else
        {success: false, errors: new_record.errors}
      end
    end
  end
  
  
  private
    def tree_for(record, root)
      if record.model.menu_root? && !root
        children = []
      else
        children = record.children.select {|record| visible_record(record)}.collect {|child| tree_for(child, false)}
      end    
      json_for_record(record, root, children)
    end
  
    def json_for_record(record, root, children)
      { id: record.id,
        index: record.index,
        name: record.name,
        icon: record.model.icon,
        type: record.model_name,
        root: root,
        menu_root: root ? false : record.model.menu_root?,
        parent_id: record.parent ? record.parent.id.to_s : '',
        children: children
      }
    end
    
    def visible_record(record)
      !record.model.hide_in_admin
    end
end

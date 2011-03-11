module Yodel
  class AdminTreePage < Page
    allowed_parents AdminLoginPage
    allowed_children nil
    searchable false
    hidden true
    
    respond_to :get do
      with :html do
        status 405
      end
      
      with :json do
        # find the root record
        begin
          record = Yodel::Model.find(params['id'])
        rescue
        end
        status 404 and return {} if record.nil?
        
        # recursively construct the tree from the root record
        tree_for(record, true)
      end
    end
    
    def tree_for(record, root)
      if record.class.menu_root? && !root
        children = []
      else
        children = record.children.collect {|child| tree_for(child, false)}
      end
      
      { id: record.id,
        name: record.name,
        icon: record.class.icon,
        type: record._type,
        root: root,
        menu_root: root ? false : record.class.menu_root?,
        children: children
      }
    end
  end
end

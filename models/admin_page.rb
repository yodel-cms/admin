module Yodel
  class AdminPage < Page
    key :class_name, String, required: true
    allowed_parents AdminLoginPage
    searchable false
    hidden true
    
    def class_and_descendants
      @class_and_descendants ||= class_name.constantize.descendants + [class_name.constantize]
    end
    
    def root_record_id
      class_name.constantize.root(site).id
    end
  end
end

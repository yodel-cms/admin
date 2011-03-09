module Yodel
  class AdminPage < Page
    key :class_name, String, required: true
    searchable false
  end
end

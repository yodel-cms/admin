module Yodel
  class AdminRecordPage < Page
    allowed_parents AdminLoginPage
    allowed_children nil
    searchable false
    hidden true
  end
end

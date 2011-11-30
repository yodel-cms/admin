class AdminRootPage < Page
  
  respond_to :get do
    with :html do
      response.redirect children.first.path
    end
  end
  
end

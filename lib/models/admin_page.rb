class AdminPage < Page
  
  respond_to :get do
    with :html do
      response.redirect '/admin/pages'
    end
  end
  
end

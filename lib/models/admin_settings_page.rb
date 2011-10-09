class AdminSettingsPage < Page
  # TODO: when Site is changed to become a normal MongoRecord, this should
  # be replaced with a plain Page, no need for anything special
  respond_to :get do
    with :html do
      return unless user_allowed_to?(:view)
      layout('html', false).render(self)
    end
  end
  
  respond_to :put do
    with :html do
      return unless user_allowed_to?(:update)
      site.name = params['name']
      site.domains = params['domains']
      site.save      
      response.redirect '/admin/settings'
    end
  end
end

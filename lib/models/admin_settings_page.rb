class AdminSettingsPage < Page
  # TODO: when Site is changed to become a normal MongoRecord, this should
  # be replaced with a plain Page, no need for anything special
  respond_to :put do
    with :json do
      site.name = params['name']
      site.idenfitier = params['identifier']
      site.domains = params['domains']
      site.save
      response.redirect_to '/admin/settings'
    end
  end
end

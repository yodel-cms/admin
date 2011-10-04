class AdminSettingsPage < Page
  # TODO: when Site is changed to become a normal MongoRecord, this should
  # be replaced with a plain Page, no need for anything special
  respond_to :put do
    with :html do
      site.name = params['name']
      site.identifier = params['identifier']
      site.domains = params['domains']
      site.save
      response.redirect '/admin/settings'
    end
  end
end

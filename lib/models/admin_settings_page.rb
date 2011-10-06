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
      identifier_was = site.identifier
      site.name = params['name']
      site.identifier = params['identifier']
      site.domains = params['domains']
      site.save
      
      if identifier_was != site.identifier
        repos = Git.open(site.site_root.to_s)
        repos.remotes.each do |remote|
          if remote.url.include?(identifier_was)
            Dir.chdir(repos.dir.to_s) do
              `git remote rm #{remote.name}`
            end
            repos.add_remote('origin', "http://#{CGI.escape(Yodel.config.remote_email)}:#{CGI.escape(Yodel.config.remote_pass)}@#{Yodel.config.remote_host}/git/#{site.identifier}")
            break
          end
        end
      end
      
      response.redirect '/admin/settings'
    end
  end
end

class AdminSyncPage < Page
  REMOTE_NAME = 'yodel'
  
  respond_to :get do
    with :json do
      return {success: false, requires_push: true} if site.remote_id.nil?
      
      conflicts = pull
      if conflicts.empty?
        {success: true}
      else
        {success: false, conflicts: conflicts}
      end
    end
  end
  
  respond_to :post do
    with :json do
      if params['remote']
        remote = Remote.find(BSON::ObjectId.from_string(params['remote']))
        response = remote.create_site
        return response if !response['success']
        
        # link the current site to the new remote
        site.remote = remote
        site.remote_id = response['id']
        
        # add a default domain for the remote
        raise "Could not find default yodel domain" if site.local_domain.nil?
        site.domains << "#{site.local_domain.gsub('.yodel', '')}.#{remote.host}"
        site.save
        
        # assign git remote
        Dir.chdir(site.root_directory.to_s) do
          remote_url = URI.parse(remote.url).merge("/git/#{site.remote_id}")
          remote_url.user = CGI.escape(remote.username)
          remote_url.password = remote.password
          `#{Yodel.config.git_path} remote rm #{REMOTE_NAME}`
          `#{Yodel.config.git_path} remote add #{REMOTE_NAME} #{remote_url}`
        end
        {success: true}
      else
        conflicts = pull
        if conflicts.empty?
          Dir.chdir(site.root_directory.to_s) do
            {success: true, status: `#{Yodel.config.git_path} push #{REMOTE_NAME} master`}
          end
        else
          {success: false, conflicts: conflicts}
        end
      end
    end
  end
  
  private
    def commit
      Dir.chdir(site.root_directory.to_s) do
        status = `#{Yodel.config.git_path} status -z`.split("\0").collect(&:strip)
        status.each do |change|
          state, file = change.split
          `#{Yodel.config.git_path} add #{file}` if state == '??' || state.include?('U')
        end
        
        unless status.empty?
          `#{Yodel.config.git_path} commit -a --allow-empty-message -m ''`
        end
      end
    end
    
    def pull
      conflicts = []
      commit
      
      Dir.chdir(site.root_directory.to_s) do
        `#{Yodel.config.git_path} pull #{REMOTE_NAME} master`
        status = `#{Yodel.config.git_path} status -z`.split("\0").collect(&:strip)
        status.each do |change|
          state, file = change.split
          conflicts << file if state.include?('U')
        end
      end
      
      conflicts
    end
end
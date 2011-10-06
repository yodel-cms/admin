class AdminSyncPage < Page
  respond_to :get do
    with :json do
      # ensure the site has been deployed to the remote server
      return {successful: false, requires_push: true} if site.remote_id.nil?
      
      # commit and pull git changes
      repos = Git.open(site.site_root.to_s)
      conflicts = pull(repos)
      return {successful: false, conflicts: conflicts} unless conflicts.empty?
      
      # pull changes to the site record
      Net::HTTP.start(Yodel.config.remote_host, Yodel.config.remote_port) do |http|
        request = Net::HTTP::Get.new("/sites/#{site.remote_id}", {})
        request.basic_auth(Yodel.config.remote_email, Yodel.config.remote_pass)
        response = http.request(request, '')
        
      end
      {successful: true}
    end
  end
  
  respond_to :post do
    with :json do
      repos = Git.open(site.site_root.to_s)
      conflicts = pull(repos)
      if conflicts.empty?
        repos.push
      else
        {successful: false, conflicts: conflicts}
      end
    end
  end
  
  private
    def commit(repos)
      status = repos.status
      changed = false
      
      # add any untracked files
      status.untracked.values.each do |untracked|
        repos.add(untracked.path)
      end
      
      # determine if any other changes have been made
      changed ||= status.changed.present?
      changed ||= status.added.present?
      changed ||= status.deleted.present?
      
      # commit changes
      repos.commit_all('') if changed
    end
    
    def pull(repos)
      commit(repos)
      repos.pull
      
      [].tap do |conflicts|
        repos.each_conflict do |file, local_version, remote_version|
          conflicts << file
        end
      end
    end
end
class AdminDefaultPagesMigration < Migration
  def self.up(site)
    home_page = site.pages.where(path: '/').first
    
    # root admin page
    admin = site.admin_pages.new
    admin.title = 'Admin'
    admin.parent = home_page
    admin.save
    
    # pages
    pages = site.tree_admin_pages.new
    pages.title = 'Pages'
    pages.parent = admin
    pages.root = home_page
    pages.save
    
    # edit
    edit_page = site.admin_editor_pages.new
    edit_page.title = 'Edit'
    edit_page.parent = admin
    edit_page.save
    
    # settings
    settings_page = site.admin_settings_pages.new
    settings_page.title = 'Settings'
    settings_page.parent = admin
    settings_page.save
    
    # syncing
    sync_page = site.admin_sync_pages.new
    sync_page.title = 'Sync'
    sync_page.parent = admin
    sync_page.save
    
    # login
    login_page = site.login_pages.new
    login_page.title = 'Login'
    login_page.page_layout = 'admin_login'
    login_page.username_field = 'email'
    login_page.redirect_to = admin
    login_page.parent = admin
    login_page.save
    
    # logout
    logout_page = site.logout_pages.new
    logout_page.title = 'Logout'
    logout_page.redirect_to = admin
    logout_page.parent = admin
    logout_page.save
  end
  
  def self.down(site)
  end
end

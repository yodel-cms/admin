class AdminDefaultPagesMigration < Migration
  def self.up(site)
    home_page = site.pages.where(path: '/').first
    
    # root admin page
    admin = site.admin_root_pages.new
    admin.title = 'Admin'
    admin.parent = home_page
    admin.show_in_menus = false
    admin.save
    
    # pages
    pages = site.admin_tree_pages.new
    pages.title = 'Pages'
    pages.parent = admin
    pages.root = home_page
    pages.save
    
    # users
    users = site.admin_list_pages.new
    users.title = 'Users'
    users.parent = admin
    users.record_model = site.users
    name_col = users.columns.new
    name_col.name = 'name'
    name_col.style = 'Text'
    name_col.save
    email_col = users.columns.new
    email_col.name = 'email'
    email_col.style = 'Text'
    email_col.save
    signup_col = users.columns.new
    signup_col.name = 'created_at'
    signup_col.as = 'Signup Date'
    signup_col.style = 'Date'
    signup_col.default_sort = true
    signup_col.save
    users.save
    
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
    
    # nav
    nav = site.menus.new
    nav.root = admin
    nav.name = 'nav'
    edit_exc = nav.exceptions.new
    edit_exc.page = edit_page
    edit_exc.save
    settings_exc = nav.exceptions.new
    settings_exc.page = settings_page
    settings_exc.save
    sync_exc = nav.exceptions.new
    sync_exc.page = sync_page
    sync_exc.save
    login_exc = nav.exceptions.new
    login_exc.page = login_page
    login_exc.save
    logout_exc = nav.exceptions.new
    logout_exc.page = logout_page
    logout_exc.save
    nav.save
  end
  
  def self.down(site)
    site.pages.where(path: '/admin').first.destroy
  end
end

class AdminDefaultPagesMigration < Migration
  def self.up(site)
    home_page = site.pages.where(path: '/').first

    admin = site.admin_pages.new
    admin.title = 'Admin'
    admin.parent = home_page
    admin.save

    pages = site.tree_admin_pages.new
    pages.title = 'Pages'
    pages.parent = admin
    pages.root = home_page
    pages.save
    
    login_page = site.login_pages.new
    login_page.title = 'Login'
    login_page.page_layout = 'admin_login'
    login_page.username_field = 'email'
    login_page.redirect_to = admin
    login_page.parent = admin
    login_page.save
  end
  
  def self.down(site)
  end
end

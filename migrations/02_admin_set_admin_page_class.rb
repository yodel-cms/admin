class AdminSetAdminPageClassMigration < Migration
  def self.up(site)
    site.admin_pages.modify do |admin_pages|
      admin_pages.record_class_name = 'AdminPage'
    end
  end
  
  def self.down(site)
    site.admin_pages.modify do |admin_pages|
      admin_pages.record_class_name = nil
    end
  end
end

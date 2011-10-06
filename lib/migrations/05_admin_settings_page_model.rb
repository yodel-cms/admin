class AdminSettingsPageModelMigration < Migration
  def self.up(site)
    site.pages.create_model :admin_settings_pages do |admin_settings_pages|
      admin_settings_pages.record_class_name = 'AdminSettingsPage'
      admin_settings_pages.allowed_children = []
      admin_settings_pages.allowed_parents = []
      admin_settings_pages.hide_in_admin = true
      admin_settings_pages.view_group = site.groups['Administrators']
      admin_settings_pages.create_group = site.groups['Administrators']
      admin_settings_pages.update_group = site.groups['Administrators']
      admin_settings_pages.delete_group = site.groups['Administrators']
    end
  end
  
  def self.down(site)
    site.admin_settings_pages.destroy
  end
end

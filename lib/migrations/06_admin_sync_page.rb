class AdminSyncPageModelMigration < Migration
  def self.up(site)
    site.pages.create_model :admin_sync_pages do |admin_sync_pages|
      admin_sync_pages.record_class_name = 'AdminSyncPage'
      admin_sync_pages.allowed_children = []
      admin_sync_pages.allowed_parents = []
      admin_sync_pages.hide_in_admin = true
      admin_sync_pages.view_group = site.groups['Administrators']
      admin_sync_pages.create_group = site.groups['Administrators']
      admin_sync_pages.update_group = site.groups['Administrators']
      admin_sync_pages.delete_group = site.groups['Administrators']
    end
  end
  
  def self.down(site)
    site.admin_sync_pages.destroy
  end
end

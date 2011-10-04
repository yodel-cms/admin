class AdminEditorPageModelMigration < Migration
  def self.up(site)
    site.pages.create_model :admin_editor_pages do |admin_editor_pages|
      admin_editor_pages.record_class_name = 'AdminEditorPage'
      admin_editor_pages.allowed_children = []
      admin_editor_pages.allowed_parents = []
      admin_editor_pages.hide_in_admin = true
    end
  end
  
  def self.down(site)
    site.admin_editor_pages.destroy
  end
end

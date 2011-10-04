class AdminTreeAdminPageModelMigration < Migration
  def self.up(site)
    site.admin_pages.create_model :tree_admin_pages do |tree_admin_pages|
      add_field :admin_page, :alias, of: :parent
      add_one :root, model: :record
      tree_admin_pages.record_class_name = 'TreeAdminPage'
      tree_admin_pages.allowed_children = []
      tree_admin_pages.allowed_parents = []
      tree_admin_pages.hide_in_admin = true
    end
  end
  
  def self.down(site)
    site.tree_admin_pages.destroy
  end
end

class AdminAdminPageModelMigration < Migration
  def self.up(site)
    site.pages.create_model :admin_pages do |admin_pages|
      admin_pages.view_group = site.groups['Administrators']
      admin_pages.create_group = site.groups['Administrators']
      admin_pages.update_group = site.groups['Administrators']
      admin_pages.delete_group = site.groups['Administrators']
      admin_pages.allowed_children = []
      admin_pages.allowed_parents = []
      admin_pages.hide_in_admin = true
    end
    
    site.admin_pages.create_model :list_admin_pages do |list_admin_pages|
      add_one :modelling, model: :model
      add_field :group_by, :string
      add_field :search_fields, :array, of: :strings
      list_admin_pages.record_class_name = 'ListAdminPage'
      list_admin_pages.allowed_children = []
      list_admin_pages.allowed_parents = []
      list_admin_pages.hide_in_admin = true
    end
  end
  
  def self.down(site)
    site.admin_pages.destroy
    site.list_admin_pages.destroy
  end
end

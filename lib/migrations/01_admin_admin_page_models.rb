class AdminAdminPageModelMigration < Migration
  def self.up(site)
    site.pages.create_model :admin_pages do |admin_pages|
      add_field :custom_layout, :string # FIXME: need way for user layouts to have parents in extensions
      add_field :admin_page, :self
      
      # permissions
      admin_pages.view_group = site.groups['Administrators']
      admin_pages.create_group = site.groups['Administrators']
      admin_pages.update_group = site.groups['Administrators']
      admin_pages.delete_group = site.groups['Administrators']
    end
    
    site.admin_pages.create_model :list_admin_pages do |list_admin_pages|
      add_field :admin_page, :alias, of: :parent
      add_one :modelling, model: :model
      add_field :group_by, :string
      add_field :search_fields, :array, of: :strings
      list_admin_pages.record_class_name = 'ListAdminPage'
    end
  end
  
  def self.down(site)
    site.admin_pages.destroy
    site.list_admin_pages.destroy
  end
end

class AdminPagesMigration < Migration
  def self.up(site)
    site.pages.create_model :admin_root_pages do |admin_root_pages|
      admin_root_pages.view_group = site.groups['Administrators']
      admin_root_pages.create_group = site.groups['Administrators']
      admin_root_pages.update_group = site.groups['Administrators']
      admin_root_pages.delete_group = site.groups['Administrators']
      admin_root_pages.allowed_children = []
      admin_root_pages.allowed_parents = []
      admin_root_pages.hide_in_admin = true
      admin_root_pages.record_class_name = 'AdminRootPage'
    end
    
    site.record_proxy_pages.create_model :admin_list_pages do |admin_list_pages|
      add_field :show_record_layout, :string, default: 'admin_list_record'
      add_field :render_form, :boolean, default: true
      add_field :show_new_button, :boolean, default: true
      add_field :partial_name, :string
      add_embed_many :columns do
        add_field :name, :string, validations: {required: {}}
        add_field :as, :string
        add_field :style, :enum, options: %w{Text Boolean Integer Float Currency Percentage Date Time DateTime Label}, default: 'Text'
        add_field :decimals, :integer
        add_field :symbol, :string, default: '$'
        add_field :true_text, :string, default: 'Yes'
        add_field :false_text, :string, default: 'No'
        add_field :format, :string
        add_embed_many :colors do
          add_field :label, :string
          add_field :color, :color
        end
        add_field :default_sort, :boolean, default: false
      end
      
      admin_list_pages.view_group = site.groups['Administrators']
      admin_list_pages.create_group = site.groups['Administrators']
      admin_list_pages.update_group = site.groups['Administrators']
      admin_list_pages.delete_group = site.groups['Administrators']
      admin_list_pages.allowed_children = []
      admin_list_pages.allowed_parents = []
      admin_list_pages.hide_in_admin = true
      admin_list_pages.record_class_name = 'AdminListPage'
    end
    
    site.pages.create_model :admin_tree_pages do |admin_tree_pages|
      add_one :root, model: :record
      admin_tree_pages.view_group = site.groups['Administrators']
      admin_tree_pages.create_group = site.groups['Administrators']
      admin_tree_pages.update_group = site.groups['Administrators']
      admin_tree_pages.delete_group = site.groups['Administrators']
      admin_tree_pages.allowed_children = []
      admin_tree_pages.allowed_parents = []
      admin_tree_pages.hide_in_admin = true
      admin_tree_pages.record_class_name = 'AdminTreePage'
    end
    
    site.pages.create_model :admin_editor_pages do |admin_editor_pages|
      admin_editor_pages.record_class_name = 'AdminEditorPage'
      admin_editor_pages.allowed_children = []
      admin_editor_pages.allowed_parents = []
      admin_editor_pages.hide_in_admin = true
      admin_editor_pages.view_group = site.groups['Administrators']
      admin_editor_pages.create_group = site.groups['Administrators']
      admin_editor_pages.update_group = site.groups['Administrators']
      admin_editor_pages.delete_group = site.groups['Administrators']
    end
    
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
    site.admin_root_pages.destroy
    site.admin_list_pages.destroy
    site.admin_tree_pages.destroy
    site.admin_editor_pages.destroy
    site.admin_settings_pages.destroy
    site.admin_sync_pages.destroy
  end
end

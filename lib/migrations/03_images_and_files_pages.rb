class ImagesAndFilesPagesMigration < Migration
  def self.up(site)
    admin = site.pages.where(path: '/admin').first

    # images
    images = site.record_proxy_pages.new
    images.title = 'Images'
    images.parent = admin
    images.record_model = site.images
    images.page_layout = 'admin_images'
    images.save
    images.create_eigenmodel
    images.model.view_group = site.groups['Administrators']
    images.model.create_group = site.groups['Administrators']
    images.model.update_group = site.groups['Administrators']
    images.model.delete_group = site.groups['Administrators']
    images.model.allowed_children = []
    images.model.allowed_parents = []
    images.model.hide_in_admin = true
    images.model.save

    # files
    files = site.record_proxy_pages.new
    files.title = 'Files'
    files.parent = admin
    files.record_model = site.files
    files.page_layout = 'admin_files'
    files.save
    files.create_eigenmodel
    files.model.view_group = site.groups['Administrators']
    files.model.create_group = site.groups['Administrators']
    files.model.update_group = site.groups['Administrators']
    files.model.delete_group = site.groups['Administrators']
    files.model.allowed_children = []
    files.model.allowed_parents = []
    files.model.hide_in_admin = true
    files.model.save

    # nav exceptions
    nav = site.menus.first(name: 'nav')
    images_exc = nav.exceptions.new
    images_exc.page = images
    images_exc.save
    files_exc = nav.exceptions.new
    files_exc.page = files
    files_exc.save
    nav.save
  end
  
  def self.down(site)
    site.pages.where(path: '/admin/images').first.destroy
    site.pages.where(path: '/admin/files').first.destroy
  end
end

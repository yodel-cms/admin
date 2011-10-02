class AdminPage < Page
  
  respond_to :get do
    with :html do
      return unless user_allowed_to?(:view)
      set_content(site.layouts.where(name: custom_layout).first.render(self))
      render_or_default(:html) do
        "<p>Sorry, a layout couldn't be found for this page</p>" # FIXME: better error message
      end
    end
  end
  
end

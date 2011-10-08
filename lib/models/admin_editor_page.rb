class AdminEditorPage < Page
  
  class Editor
    attr_reader :name, :command
    def exists?; path.present?; end
    def path; @path ||= `which #{@command}`.strip; end
    def edit(site); `#{path} #{site.root_directory}`; end
    def initialize(name, command)
      @name = name
      @command = command
    end
  end
  
  EDITORS = [Editor.new('TextMate', 'mate')]
  
  def self.available_editors
    @available_editors ||= EDITORS.select(&:exists?)
  end
  
  respond_to :get do
    with :html do
      if params['editor']
        EDITORS.find {|e| e.command == params['editor']}.try(:edit, site)
      end
    end
  end
end

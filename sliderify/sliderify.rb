require 'json'
require 'erb'

module Sliderify
  class Page
    attr :config
    def initialize(type)
      @config = {:type => type}
    end

    def method_missing(name, arg)
      @config.merge!({name => arg})
    end
  end

  def page(type, &block)
    pa = Page.new(type)
    pa.instance_eval(&block)
    @pages << pa.config
  end
end

include Sliderify

@pages = []
load 'sample/contents.rb'

erb = ERB.new(File.read('sliderify/contents.js.erb'))
open("sample/contents.js", "w") {|f| f.write erb.result(binding)}

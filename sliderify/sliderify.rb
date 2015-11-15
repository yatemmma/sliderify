require 'json'
require 'erb'

target = ARGV.first
target = target ||= 'sample'

unless File.directory? target
  Dir.mkdir target
  File.open("#{target}/contents.rb", "w").close
end

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
load "#{target}/contents.rb"

erb = ERB.new(File.read('sliderify/contents.js.erb'))
open("#{target}/contents.js", "w") {|f| f.write erb.result(binding)}

puts "open url => file://#{Dir.pwd}/index.html?slide=#{target}"

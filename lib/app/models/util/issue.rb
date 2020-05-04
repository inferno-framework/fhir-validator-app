# frozen_string_literal: true

module FHIRValidator
  # Issue contains information about problems returned from validation systems,
  # including the line # of the validated file the issue resulted from,
  # and a textual representation of the issue.
  class Issue
    attr_accessor :line, :text

    def initialize(line:, text:)
      self.line = line
      self.text = text
    end
  end
end

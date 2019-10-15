# frozen_string_literal: true

require 'bloomer'
require 'byebug'
require 'rest-client'
require 'zip'
require 'yaml'

Dir[File.join(__dir__, '..', 'app', 'models', 'util', '*.rb')].each { |file| require file }

namespace :terminology do |_argv|
  desc 'download and execute UMLS terminology data'
  task :download_umls, [:username, :password] do |_t, args|
    # Adapted from python https://github.com/jmandel/umls-bloomer/blob/master/01-download.py
    default_target_file = 'https://download.nlm.nih.gov/umls/kss/2018AB/umls-2018AB-full.zip'

    puts 'Getting Login Page'
    response = RestClient.get default_target_file
    # Get the final redirection URL
    login_page = response.history.last.headers[:location]
    action_base = login_page.split('/cas/')[0]
    action_path = response.body.split('form id="fm1" action="')[1].split('"')[0]
    execution = response.body.split('name="execution" value="')[1].split('"')[0]

    begin
      puts 'Getting Download Link'
      RestClient::Request.execute(method: :post,
                                  url: action_base + action_path,
                                  payload: {
                                    username: args.username,
                                    password: args.password,
                                    execution: execution,
                                    _eventId: 'submit'
                                  },
                                  max_redirects: 0)
    rescue RestClient::ExceptionWithResponse => e
      follow_redirect(e.response.headers[:location], e.response.headers[:set_cookie])
    end
    puts 'Finished Downloading!'
  end

  def follow_redirect(location, cookie = nil)
    return unless location

    size = 0
    percent = 0
    current_percent = 0
    File.open('umls.zip', 'w') do |f|
      block = proc do |response|
        puts response.header['content-type']
        if response.header['content-type'] == 'application/zip'
          total = response.header['content-length'].to_i
          response.read_body do |chunk|
            f.write chunk
            size += chunk.size
            percent = ((size * 100) / total).round unless total.zero?
            if current_percent != percent
              current_percent = percent
              puts "#{percent}% complete"
            end
          end
        else
          follow_redirect(response.header['location'], response.header['set-cookie'])
        end
      end
      RestClient::Request.execute(
        method: :get,
        url: location,
        headers: { cookie: cookie },
        block_response: block
      )
    end
  end

  desc 'unzip umls zip'
  task :unzip_umls, [:umls_zip] do |_t, args|
    args.with_defaults(umls_zip: 'umls.zip')
    destination = 'resources/terminology/umls'
    # https://stackoverflow.com/questions/19754883/how-to-unzip-a-zip-file-containing-folders-and-files-in-rails-while-keeping-the
    Zip::File.open(args.umls_zip) do |zip_file|
      # Handle entries one by one
      zip_file.each do |entry|
        # Extract to file/directory/symlink
        puts "Extracting #{entry.name}"
        f_path = File.join(destination, entry.name)
        FileUtils.mkdir_p(File.dirname(f_path))
        zip_file.extract(entry, f_path) unless File.exist?(f_path)
      end
    end
    Zip::File.open(File.expand_path("#{Dir["#{destination}/20*"][0]}/mmsys.zip")) do |zip_file|
      # Handle entries one by one
      zip_file.each do |entry|
        # Extract to file/directory/symlink
        puts "Extracting #{entry.name}"
        f_path = File.join((Dir["#{destination}/20*"][0]).to_s, entry.name)
        FileUtils.mkdir_p(File.dirname(f_path))
        zip_file.extract(entry, f_path) unless File.exist?(f_path)
      end
    end
  end

  desc 'run umls jar'
  task :run_umls, [:my_config] do |_t, args|
    # More information on batch running UMLS
    # https://www.nlm.nih.gov/research/umls/implementation_resources/community/mmsys/BatchMetaMorphoSys.html
    args.with_defaults(my_config: 'all-active-exportconfig.prop')
    jre_version = if !(/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM).nil?
                    'windows64'
                  elsif !(/darwin/ =~ RUBY_PLATFORM).nil?
                    'macos'
                  else
                    'linux'
                  end
    puts "#{jre_version} system detected"
    config_file = Dir.pwd + "/resources/terminology/#{args.my_config}"
    output_dir = Dir.pwd + '/resources/terminology/umls_subset'
    FileUtils.mkdir(output_dir)
    puts "Using #{config_file}"
    Dir.chdir(Dir['resources/terminology/umls/20*'][0]) do
      Dir['lib/*.jar'].each do |jar|
        File.chmod(0o555, jar)
      end
      puts 'Running MetamorphoSys (this may take a while)...'
      output = system("./jre/#{jre_version}/bin/java " \
                          '-Djava.awt.headless=true ' \
                          '-cp .:lib/jpf-boot.jar ' \
                          '-Djpf.boot.config=./etc/subset.boot.properties ' \
                          '-Dlog4j.configuration=./etc/log4j.properties ' \
                          '-Dinput.uri=. ' \
                          "-Doutput.uri=#{output_dir} " \
                          "-Dmmsys.config.uri=#{config_file} " \
                          '-Xms300M -Xmx8G ' \
                          'org.java.plugin.boot.Boot')
      p output
    end
    puts 'done'
  end

  desc 'cleanup umls'
  task :cleanup_umls, [] do |_t, _args|
    puts 'removing umls.zip...'
    File.delete('umls.zip') if File.exist?('umls.zip')
    puts 'removing unzipped umls...'
    if File.directory?('resources/terminology/umls')
      FileUtils.remove_dir('resources/terminology/umls')
    end
    puts 'removing umls subset...'
    if File.directory?('resources/terminology/umls_subset')
      FileUtils.remove_dir('resources/terminology/umls_subset')
    end
    puts 'removing umls.db'
    File.delete('umls.db') if File.exist?('umls.db')
    puts 'removing MRCONSO.pipe'
    File.delete('MRCONSO.pipe') if File.exist?('MRCONSO.pipe')
    puts 'removing MRREL.pipe'
    File.delete('MRREL.pipe') if File.exist?('MRREL.pipe')
  end

  desc 'post-process UMLS terminology file'
  task :process_umls, [] do |_t, _args|
    require 'find'
    require 'csv'
    puts 'Looking for `./resources/terminology/MRCONSO.RRF`...'
    input_file = Find.find('resources/terminology').find { |f| /MRCONSO.RRF$/ =~f }
    if input_file
      start = Time.now
      output_filename = 'resources/terminology/terminology_umls.txt'
      output = File.open(output_filename, 'w:UTF-8')
      line = 0
      excluded = 0
      excluded_systems = Hash.new(0)
      begin
        puts "Writing to #{output_filename}..."
        CSV.foreach(input_file, headers: false, col_sep: '|', quote_char: "\x00") do |row|
          line += 1
          include_code = false
          code_system = row[11]
          code = row[13]
          description = row[14]
          case code_system
          when 'SNOMEDCT_US'
            code_system = 'SNOMED'
            include_code = (row[4] == 'PF' && ['FN', 'OAF'].include?(row[12]))
          when 'LNC'
            code_system = 'LOINC'
            include_code = true
          when 'ICD10CM'
            code_system = 'ICD10'
            include_code = (row[12] == 'PT')
          when 'ICD10PCS'
            code_system = 'ICD10'
            include_code = (row[12] == 'PT')
          when 'ICD9CM'
            code_system = 'ICD9'
            include_code = (row[12] == 'PT')
          when 'CPT'
            include_code = (row[12] == 'PT')
          when 'HCPCS'
            include_code = (row[12] == 'PT')
          when 'MTHICD9'
            code_system = 'ICD9'
            include_code = true
          when 'RXNORM'
            include_code = true
          when 'CVX'
            include_code = ['PT', 'OP'].include?(row[12])
          when 'SRC'
            # 'SRC' rows define the data sources in the file
            include_code = false
          else
            include_code = false
            excluded_systems[code_system] += 1
          end
          if include_code
            output.write("#{code_system}|#{code}|#{description}\n")
          else
            excluded += 1
          end
        end
      rescue StandardError => e
        puts "Error at line #{line}"
        puts e.message
      end
      output.close
      puts "Processed #{line} lines, excluding #{excluded} redundant entries."
      puts "Excluded code systems: #{excluded_systems}" unless excluded_systems.empty?
      finish = Time.now
      minutes = ((finish - start) / 60)
      seconds = (minutes - minutes.floor) * 60
      puts "Completed in #{minutes.floor} minute(s) #{seconds.floor} second(s)."
      puts 'Done.'
    else
      download_umls_notice
    end
  end

  def download_umls_notice
    puts 'UMLS file not found.'
    puts 'Download the US National Library of Medicine (NLM) Unified Medical Language System (UMLS) Full Release files'
    puts '  -> https://www.nlm.nih.gov/research/umls/licensedcontent/umlsknowledgesources.html'
    puts 'Install the metathesaurus with the following data sources:'
    puts '  CVX|CVX;ICD10CM|ICD10CM;ICD10PCS|ICD10PCS;ICD9CM|ICD9CM;LNC|LNC;MTHICD9|ICD9CM;RXNORM|RXNORM;SNOMEDCT_US|SNOMEDCT;CPT;HCPCS'
    puts 'After installation, copy `{install path}/META/MRCONSO.RRF` into your `./resources/terminology` folder, and rerun this task.'
  end

  desc 'post-process UMLS terminology file for translations'
  task :process_umls_translations, [] do |_t, _args|
    require 'find'
    puts 'Looking for `./resources/terminology/MRCONSO.RRF`...'
    input_file = Find.find('resources/terminology').find { |f| /MRCONSO.RRF$/ =~f }
    if input_file
      start = Time.now
      output_filename = 'resources/terminology/translations_umls.txt'
      output = File.open(output_filename, 'w:UTF-8')
      line = 0
      excluded_systems = Hash.new(0)
      begin
        entire_file = File.read(input_file)
        puts "Writing to #{output_filename}..."
        current_umls_concept = nil
        translation = Array.new(10)
        entire_file.split("\n").each do |l|
          row = l.split('|')
          line += 1
          concept = row[0]
          if concept != current_umls_concept && !current_umls_concept.nil?
            unless translation[1..-2].reject(&:nil?).length < 2
              output.write("#{translation.join('|')}\n")
            end
            translation = Array.new(10)
            current_umls_concept = concept
            translation[0] = current_umls_concept
          elsif current_umls_concept.nil?
            current_umls_concept = concept
            translation[0] = current_umls_concept
          end
          code_system = row[11]
          code = row[13]
          translation[9] = row[14]
          case code_system
          when 'SNOMEDCT_US'
            translation[1] = code if row[4] == 'PF' && ['FN', 'OAF'].include?(row[12])
          when 'LNC'
            translation[2] = code
          when 'ICD10CM'
            translation[3] = code if row[12] == 'PT'
          when 'ICD10PCS'
            translation[3] = code if row[12] == 'PT'
          when 'ICD9CM'
            translation[4] = code if row[12] == 'PT'
          when 'MTHICD9'
            translation[4] = code
          when 'RXNORM'
            translation[5] = code
          when 'CVX'
            translation[6] = code if ['PT', 'OP'].include?(row[12])
          when 'CPT'
            translation[7] = code if row[12] == 'PT'
          when 'HCPCS'
            translation[8] = code if row[12] == 'PT'
          when 'SRC'
            # 'SRC' rows define the data sources in the file
          else
            excluded_systems[code_system] += 1
          end
        end
      rescue StandardError => e
        puts "Error at line #{line}"
        puts e.message
      end
      output.close
      puts "Processed #{line} lines."
      puts "Excluded code systems: #{excluded_systems}" unless excluded_systems.empty?
      finish = Time.now
      minutes = ((finish - start) / 60)
      seconds = (minutes - minutes.floor) * 60
      puts "Completed in #{minutes.floor} minute(s) #{seconds.floor} second(s)."
      puts 'Done.'
    else
      download_umls_notice
    end
  end

  desc 'Create ValueSet Validators'
  task :create_vs_validators, [:database, :type] do |_t, args|
    args.with_defaults(database: 'umls.db', type: 'bloom')
    validator_type = args.type.to_sym
    FHIRValidator::Terminology.register_umls_db args.database
    FHIRValidator::Terminology.load_valuesets_from_directory('resources', true)
    FHIRValidator::Terminology.create_validators(validator_type)
  end
end

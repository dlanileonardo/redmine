/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */
// Adds the systems that shape your system
systems({
  redmine: {
    // Dependent systems
    depends: ["mysql"],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/ruby"},
    // Steps to execute before running instances
    provision: [
      "bundle install --path /azk/bundler",
      "bundle exec rake db:create",
      "bundle exec rake db:migrate",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "bundle exec rackup config.ru --pid /tmp/ruby.pid --port $HTTP_PORT --host 0.0.0.0",
    wait: {"retry": 20, "timeout": 1000},
    mounts: {
      '/azk/#{manifest.dir}': sync("."),
      '/azk/bundler': persistent("#{manifest.dir}/bundler"),
      '/azk/#{manifest.dir}/tmp': persistent("#{manifest.dir}/tmp"),
      '/azk/#{manifest.dir}/log': path("#{manifest.dir}/log"),
      '/azk/#{manifest.dir}/.bundle': path("#{manifest.dir}/.bundle"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    ports: {
      // exports global variables
      http: "3000/tcp",
    },
    envs: {
      // Make sure that the PORT value is the same as the one
      // in ports/http below, and that it's also the same
      // if you're setting it in a .env file
      RUBY_ENV: "development",
      RAILS_ENV: "development",
      BUNDLE_APP_CONFIG: "/azk/bundler",
    },
  },
  mysql: {
    // Dependent systems
    depends: [],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/mysql:5.6"},
    shell: "/bin/bash",
    wait: {"retry": 25, "timeout": 1000},
    mounts: {
      '/var/lib/mysql': persistent("#{manifest.dir}/mysql"),
    },
    ports: {
      // exports global variables
      data: "3306/tcp",
    },
    envs: {
      // Make sure that the PORT value is the same as the one
      // in ports/http below, and that it's also the same
      // if you're setting it in a .env file
      MYSQL_ROOT_PASSWORD: "mysecretpassword",
      MYSQL_USER: "azk",
      MYSQL_PASS: "azk",
      MYSQL_DATABASE: "#{manifest.dir}_development",
    },
    export_envs: {
      // check this gist to configure your database
      // https://gist.github.com/gullitmiranda/62082f2e47c364ef9617
      DATABASE_URL: "mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASS}@#{net.host}:#{net.port.data}/${envs.MYSQL_DATABASE}",
    },
  },
  postgres: {
    // Dependent systems
    depends: [],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/postgres:9.3"},
    shell: "/bin/bash",
    wait: {"retry": 20, "timeout": 1000},
    mounts: {
      '/var/lib/postgresql/data': persistent("postgresql"),
      '/var/log/postgresql': path("./log/postgresql"),
    },
    ports: {
      // exports global variables
      data: "5432/tcp",
    },
    envs: {
      // set instances variables
      POSTGRESQL_USER: "azk",
      POSTGRESQL_PASS: "azk",
      POSTGRESQL_DB: "postgres_development",
    },
    export_envs: {
      // check this gist to configure your database
      // https://gist.github.com/gullitmiranda/62082f2e47c364ef9617
      DATABASE_URL: "postgres://#{envs.POSTGRESQL_USER}:#{envs.POSTGRESQL_PASS}@#{net.host}:#{net.port.data}/${envs.POSTGRESQL_DB}",
    },
  },
});

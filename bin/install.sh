#!/usr/bin/env bash
# Installs ruby, rails and all prerequisites

# Check for db env vars
if [[ -z "${DB_NAME}" || -z "${DB_ROOT_USER}" || -z "${DB_ROOT_PASSWORD}" ]]
then
  echo "DB_NAME, DB_ROOT_USER, and DB_ROOT_PASSWORD must be environment variables";
  exit 1;
fi

command -v sudo >/dev/null 2>&1 || { echo >&2 "sudo is required"; exit 1; }
command -v apt-get >/dev/null 2>&1 || { echo >&2 "apt-get is required"; exit 1; }
command -v wget >/dev/null 2>&1 || { echo >&2 "wget is required"; exit 1; }

sudo apt-get update
command -v make >/dev/null 2>&1 || { sudo apt-get install make; };
  # make is a prereq for ruby-install and chruby
sudo apt-get install --assume-yes mariadb-server mariadb-client ruby-mysql libmysqlclient-dev imagemagick

if !(command -v ruby-install >/dev/null 2>&1)
then
  # Change to a temporary directory so stuff isn't cluttered
  pushd .
  cd /tmp
  # Install ruby-install
  wget -O ruby-install-0.6.0.tar.gz https://github.com/postmodern/ruby-install/archive/v0.6.0.tar.gz;
  tar -xzvf ruby-install-0.6.0.tar.gz;
  cd ruby-install-0.6.0/;
  sudo make install;

  popd
fi

# Install ruby 2.3.1 if it isn't already
if !(test -d ~/.rubies/ruby-2.3.1/)
then
  ruby-install ruby-2.3.1;
fi

if !( command -v chruby >/dev/null 2>&1)
then
  
  if !(test -e /usr/local/share/chruby/chruby.sh)
  then
    # Change to a temporary directory so stuff isn't cluttered
    pushd .
    cd /tmp

    # Install chruby
    wget -O chruby-0.3.9.tar.gz https://github.com/postmodern/chruby/archive/v0.3.9.tar.gz;
    tar -xzvf chruby-0.3.9.tar.gz;
    cd chruby-0.3.9/;
    sudo make install;

    echo "source /usr/local/share/chruby/chruby.sh" >> ~/.bashrc;
      # add the chruby command to the path
    echo "source /usr/local/share/chruby/auto.sh" >> ~/.bashrc;
      # adds auto-switching to chruby
    popd
  fi

  source /usr/local/share/chruby/chruby.sh;
  source /usr/local/share/chruby/auto.sh;
fi

chruby ruby-2.3.1

cd "$(dirname "$0")/../"
  # change to the root of the project directory
gem which bundler >/dev/null 2>&1 || { gem install bundler; }
bundle install

mysql -u $DB_ROOT_USER -p$DB_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME"

echo "Either restart your shell or run:"
echo "source /usr/local/share/chruby/chruby.sh"
echo "chruby ruby-2.3.1"
exit

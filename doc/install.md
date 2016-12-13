# Installation Instructions

## Clone the Repo
https://github.com/jakesebright/capstone_web_server.git


## Install ruby-install
Install ruby-install:
https://github.com/postmodern/ruby-install
~~~~~
wget -O ruby-install-0.6.0.tar.gz https://github.com/postmodern/ruby-install/archive/v0.6.0.tar.gz
tar -xzvf ruby-install-0.6.0.tar.gz
cd ruby-install-0.6.0/
sudo make install
~~~~~


## Install Ruby 2.3.1
Run:
`ruby-install ruby-2.3.1`
to install ruby for the local user. If you don't you will need to use sudo or the root password.


## Install chruby
install chruby:
`https://github.com/postmodern/chruby`
~~~~~
wget -O chruby-0.3.9.tar.gz https://github.com/postmodern/chruby/archive/v0.3.9.tar.gz
tar -xzvf chruby-0.3.9.tar.gz
cd chruby-0.3.9/
sudo make install
~~~~~

Add the following to `~/.bashrc`. The first line adds the chruby command. 
The second line adds auto-switching.
~~~~~
source /usr/local/share/chruby/chruby.sh
source /usr/local/share/chruby/auto.sh
~~~~~


## Verify project directory has a .ruby-version file
Verify there is a file called .ruby-version that has `ruby-2.3.1` on the first line. 
This will make chruby automatically switch to ruby-2.3.1 when you cd to your project directory.


## PGP
All releases are PGP signed for security.

### Importing the public-key
My PGP key 0xB9515E77 can be securely downloaded from GitHub:
~~~~~
$ wget https://raw.github.com/postmodern/postmodern.github.io/master/postmodern.asc
$ gpg --import postmodern.asc
gpg: key B9515E77: public key "Postmodern Modulus III (Postmodern) <postmodern.mod3@gmail.com>" imported
gpg: Total number processed: 1
gpg:               imported: 1
~~~~~
In order to verify that you have imported the correct key, run the following command:
~~~~~
$ gpg --fingerprint 0xB9515E77
pub   1024D/B9515E77 2009-09-18
      Key fingerprint = 04B2 F3EA 6541 40BC C7DA  1B57 54C3 D9E9 B951 5E77
uid                  Postmodern Modulus III (Postmodern) <postmodern.mod3@gmail.com>
sub   4096g/4BD91DF0 2009-09-18
~~~~~
Make sure to verify that the “Key fingerprint” matches.

#### Verify ruby-install
To verify that a release was not tampered with:
~~~~~
wget https://raw.github.com/postmodern/ruby-install/master/pkg/ruby-install-0.6.0.tar.gz.asc
gpg --verify ruby-install-0.6.0.tar.gz.asc ruby-install-0.6.0.tar.gz
~~~~~

#### Verify chruby
To verify that a release was not tampered with:
~~~~~
wget https://raw.github.com/postmodern/chruby/master/pkg/chruby-0.3.9.tar.gz.asc
gpg --verify chruby-0.3.9.tar.gz.asc chruby-0.3.9.tar.gz
~~~~~


## Install bundler
Inside the project directory, run `gem install bundler`. 


## Run bundle Install
Run `bundle install`


## Start the web server
Run `rails server` to start the web server. Run `rails server --help` to see options to set the port or ip address the server will run on.

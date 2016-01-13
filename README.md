Nexus
=====

An early implementation of the GPII Nexus integration technology.

See: https://wiki.gpii.net/w/Nexus_API

Running Nexus
-------------

Please note that at this stage of development, some of the Nexus
endpoints enable arbitrary JavaScript to be sent to the Nexus over
HTTP to be run within the Nexus Node.js process. Therefore, it is
recommended that the Nexus be run within a Virtual Machine. A Vagrant
configuration is provided for running Nexus.

- `vagrant up` - install dependencies and run Nexus within a VM
- `vagrant halt` - stop the VM
- `vagrant destroy` - delete the VM

For more information on the use of Vagrant, please see:
https://github.com/GPII/qi-development-environments

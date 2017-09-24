# Set vagrant version and provider
VARGRANT_API_VERSION = '2'

# Install Dependencies
if ARGV[0] == 'up' || ARGV[0] == 'provision'
    system('npm install')
end

# Configure the VM
Vagrant.configure(VARGRANT_API_VERSION) do |config|
    config.vm.box = 'ubuntu/trusty64'
    config.vm.communicator = 'ssh'

    # Set IP and forward ports
    config.vm.network 'private_network', ip: '10.10.10.91'
    config.vm.network :forwarded_port, guest: 8082, host: 8082, auto_correct: true

    # Update all apps
    config.vm.provision :shell, inline: 'sudo apt-get update -y'

    # Provision docker
    config.vm.provision :docker

    # Provision docker-compose, and up container
    config.vm.provision :docker_compose,
        yml: '/vagrant/docker-compose.yml',
        project_name: 'edison-site',
        rebuild: true,
        compose_version: '1.8.0'
end

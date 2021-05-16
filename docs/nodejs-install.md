# Install NodeJS

NodeJs is free open-source javascript runtime. It can be downloaded from its [officieal site](https://nodejs.org)

## Windows

1. Download the windows package from [NodeJS site](https://nodejs.org/en/download/)
    - [Direct links](https://nodejs.org/dist/v16.1.0/node-v16.1.0-x64.msi)

1. Launch installer

1. Follow the wizard.
    - On welcom screen, click **Next**
        ![Node JS Installler Welcome Screen](images/nodejs-install-welcome-screen.png)
    - Accept EULA by ticking checkbox at bottom and click **Next**
        ![EULA Agreement](images/nodejs-install-eula.png)
    - Select destination directory
        ![Destination Directory](images/nodejs-install-destination.png)
    - Features selected by default are sufficient. Click **Next**
        ![Feature Selection](images/nodejs-install-features.png)
    - On Native Modules screen, **Select** Automatically install the neccessary tools and click **Next**
        ![Tools for Native Modules](images/nodejs-install-native-tools.png)
    - Ready to install. Click **Next**. You may get a Windows confirmation screen to allow application to escalate privilages. Approve that
        ![Ready to Install](images/nodejs-install-ready.png)
    - Wizard will go through few steps automatically
    - There will be a command prompt for tool installation. Press any key to allow it to install
        ![Native Module Install Script](images/node-install-native-module-script.png)
    - Thi will open a new PowerShell windows which installs multiple tools. It may take upto 30 min to complete.
        ![PowerShell to Install Runtimes](images/node-install-powershell.png)
    - After some time you will see following. Press ENTER to exit
    ![Powershell Finish](images/node-install-poweshell-end.png)

1. Setup git
    - Lauch a terminal (Command Prompt will do)
    - Run following command
        
        ```bash
        choco install git
        ```

    - Program will ask for confirmation for running script. Type `A` and press enter.
        ![Git Install Confirmation](images/git-install-confirm.png)
    - Once setup is finished, refresh environemnt
        
        ```bash
        refreshenv
        ```

1. Check everything is setup correctly. Type following commands to check all the tools.
    - Node

        ```bash
        node -v
        ```

    - NPX

        ```bash
        npx -v
        ```

    - Git

        ```bash
        git -v
        ```

## MacOS

1. Download the windows package from [NodeJS site](https://nodejs.org/en/download/)
    - [Direct link](https://nodejs.org/dist/v16.1.0/node-v16.1.0.pkg)

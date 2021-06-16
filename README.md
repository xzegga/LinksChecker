# Links Checker


LinksChecker is an node web api built completely with raw node.js. No frameworks, no external libraries, no npm, just plane javascript and node runtime. 
This app simulate an uptime monitor that allow the users to enter URLs they want to monitored and receive alerts when those resources "go down" or "come back up"

## Development Environment

At the bare minimum you'll need the following for your development environment:

1. [Node](https://nodejs.org/en/)

It is strongly recommended to also install and use the following tools:

1. [nvm](https://github.com/nvm-sh/nvm)

### Local Setup

The following assumes you have all of the recommended tools listed above installed.

#### 1. Clone the project:

    $ git clone https://github.com/xzegga/linksChecker.git
    $ cd linksChecker

#### 2. If you want to use nvm you can download your node version wiht:

    $ nvm install 11.0.0
    $ nvm use 11.0.0

#### 3. Set your node environment variables

To make the app send sms messages notifications to the users you need to get a Twilio api credentials. You can get a frial account to test here https://www.twilio.com/

    TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN
    TWILIO_MESSAGING_SERVICE_ID
    TWILIO_FROM_PHONE

#### 4. Run the development server:

    $ node index.js

#### 5. Open [http://localhost:3000](http://localhost:3000) for http and [http://localhost:3000](https://localhost:3001) for https support (You need to create a key.pem and cert.pem with openssl and put those file in https folder)




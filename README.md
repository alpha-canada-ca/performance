# Analytics API

# Table of Contents #
  * [Setup](#setup)
  * [What is needed](#what-is-needed)

## Setup

* Download the Web Experience Toolkit (WET) Canada.ca theme (GCWeb) from the following link: [themes-dist-6.0-gcweb.zip](https://github.com/wet-boew/GCWeb/releases/download/v6.0/themes-dist-6.0-gcweb.zip)
  * Rename the folder to gcweb and place in the root of the folder
* Update */php/config.php* with the values of your API
* Include a */keys/* folder with a *secret.pem*.

## What is needed

* PHP 7.2 and above
  * If that cannot be provided, above PHP 5.5.
* PHP with the extensions enabled:
  * curl; and
  * openssl
* OpenSSL above 1.0.1 (latest)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [VSCODE-TPL README](#vscode-tpl-readme)
  - [Why Visual Studio Code?](#why-visual-studio-code)
  - [Releases](#releases)
    - [v1.0.0](#v100)
  - [Installation](#installation)
  - [Want to Contribute?](#want-to-contribute)
  - [Future Plans](#future-plans)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- Usage: use `doctoc README.md` and `doctoc CHANGELOG.md`, do NOT use `doctoc .` -->

<p align="center">
  <br />
  <a title="Learn more about VSCode TPL" href="https://github.com/cdpautsch/vscode-tpl"><img src="https://raw.githubusercontent.com/cdpautsch/vscode-tpl/master/images/readme-icon.png" alt="VSCode TPL Logo" /></a>
</p>

# VSCODE-TPL README

The Pattern Language (TPL) syntax highlighting extension for Visual Studio Code. TPL is used to create rules and models which describe applications, products and other real-world entities that have been modeled in BMC Discovery.

This repository was manually copied (instead of being properly forked) from the repo by dudexino. This was an accident and was not an attempt to take credit for his work. The original repo is located here: https://github.com/dudexino/vscode-tpl

The original repo was based on existing extension for Atom editor: https://github.com/trianglesis/language-tplpre

TPL is used in BMC's Discovery application. Full documentation can be found here: https://docs.bmc.com/docs/display/DISCO113

TPL Documentation: https://docs.bmc.com/docs/display/DISCO113/The+Pattern+Language+TPL

This extension is not endorsed or sponsored by BMC in any way. The intent is to provide a tool to help developers who work with TPL and Discovery.

## Why Visual Studio Code?
Visual Studio Code is a much more powerful tool than simple text editors. It is customizable and lightweight, making it ideal for a lesser known language such as TPL. You can open up a directory of TPL patterns, giving you the option to search them all inside the editor, make global changes, and organize projects with greater efficiency. It runs on Windows, Mac, and Linux.

Download VS Code here: https://code.visualstudio.com/

## Releases
### v1.0.0
Released 6/1/19. Can be installed via the VSCode marketplace, or downloaded from the release list on Github.

## Installation
* Option 1: Clone the Git repo to your computer (generally only for development):
  * Using SSH: `git clone git@github.com:cdpautsch/vscode-tpl.git`. _Note: This method requires you to setup an [SSH key](https://help.github.com/en/articles/connecting-to-github-with-ssh)_.
  * Using HTTPS: `git clone https://github.com/cdpautsch/vscode-tpl.git`
  * _For the rest of the steps, see 'Option 3' below._
* Option 2: Download from the VSCode Marketplace
  * Simply search for "The Pattern Language TPL" and it should come up.
  * Install in VSCode from within the app
* Option 3: Download a release from this Github
  * We have releases in `.zip`, `.tar.gz`, and `vsix` options. Download one of these.
  * (unless you have the `vsix` version) Copy the extension (the entire folder) into the extensions folder and restart Visual Studio Code. This folder is located in the following locations:
    * __Windows__: `%USERPROFILE%\.vscode\extensions`
    * __macOS__: `~/.vscode/extensions`
    * __Linux__: `~/.vscode/extensions`
  * (if you download the `vsix` version) Install using the command line: `code --install-extension my-extension-0.0.1.vsix`

## Want to Contribute?
This repository is open to contributions from others. Please follow contribution guidelines:
* For bugs or other problems, please create an issue using the bug template.
* If you have a particular feature in mind, please create an issue using the feature template.
* New features and fixes should be made in a new branch, split off from master, then merged with a pull request that requires approvals of at least 2 others (or admin approval).

## Future Plans
* Develop a custom theme which provides custom theming for TPL colors
* Develop a system for linting TPL code
* Develop a system for error-checking

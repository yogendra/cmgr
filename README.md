# Campaign Manager (cmgr)

A simple utility to send message on whatsapp.

## Prerequisite

1. Install [NodeJS 16.1+](https://nodejs.org/en/download/)
    - Download the package and execute installer
1. [Windows Terminal](https://www.microsoft.com/en-sg/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab) **Windows Only**
    - Download package and execute installer



## How to use it?

1. Create a [campaign folder](#campaign-folder). Example: `campaign`
    - **TIP:** On windows, you may put it on desktop for easily running program
    - If its not on desktop that you have to provide full path of the folder
1. Start your terminal applications

1. Check NodeJS

    ```bash
    node -v
    ```

    **Output:**

    ```bash
    v16.1.0
    ```

1. Check NPX

    ```bash
    npx -v
    ```

    **Output:**

    ```bash
    7.11.2
    ```

1. Run campaign
    ```bash
    npx -p github:yogendra/cmgr campaign
    ```

## Campaign Folder

A campaign folder has your contacts and messages to post.

![Campaign Folder](docs/images/campaign-folder.png)

In the example above, there are 5 messages.

[Click here to download a sample](example/campaign.zip)

### Contacts

Contacts are in a Comma Separated Values (CSV) file.

This file can be edited with Excel/Keynote/Google Sheets.
![Contacts CSV in Excel](docs/images/contacts-csv-in-excel.png)

Or you can edit it in a good text editor.
![Contacts CSV in Text](docs/images/contacts-csv-in-text.png)

This has 3 columns:

1. **phone** - (_Required_) phone number of contact. A phone number:
    - Must have ISD code. **This is a must**
    - May have a `+` in front. Example: `+65898829832`
    - May have spaces in middle: Example: `+65 8988 29832`
    - May have non-numerice characters: `+65 000 - 00000` or `+65 (000) 00000`
1. **name** - (Optional) - Name of the contact
1. **nickname** - (Optional) - Nick name of contact

Example:
|phone|name|nickname|
|-|-|-|
|6500000000|Yogi Bear|Yogi|
|+6500000000|Booboo Bear|Booboo|
|+65 0000 0000|Ranger Smith| Ranger|
|+65 (000) 00000|
|+65 000 - 00000|

[Click here to download a sample](example/campaign/contacts.csv)

### Messages

Messages are stored in files. Messages can be text or pictures.

- Text messages are stored with `txt` extensions. You can edit it using Notepad, TextEdit, etc.

- Picture messages can be send with JPG or PNG files.

**Important**: Messages are sent in the alphabatical order of the file names.
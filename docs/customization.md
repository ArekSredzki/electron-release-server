# Customization
Although this project is infinitely customizable through the process of forking the repo and making code changes, users that are satisfied with minimal branding can achieve this through environment variables.

The following environment variables can be set to customize the website:
 - `WEBSITE_APP_TITLE`: The app name to use throughout the website.
 - `WEBSITE_TITLE`: The title text to show on the home page and to use as the page title.
 - `WEBSITE_HOME_CONTENT`: Content to display below the title on the home page.
 - `WEBSITE_NAV_LOGO`: A url to a logo image that will be shown in place of the default Electron logo.

If you are deploying the app through `docker-compose`, then you can simply adjust these parameters in `docker-compose.yml`.

# MyWishlist Control Panel setup

The Control Panel's announcements are visible to everyone. Creating, editing, and deleting announcements requires administrator access.

## Configure the administrator password

Set `ADMIN_PASSWORD` in the server environment. Do not put the password in frontend JavaScript or commit it to Git.

For a local Docker run in PowerShell:

```powershell
$env:WISHLIST_ADMIN_PASSWORD = Read-Host "Choose an administrator password"
docker build -f dockerfile -t mywishlist:v3 .
docker run -d --name mywishlist-v3 -p 5051:5050 -e ADMIN_PASSWORD="$env:WISHLIST_ADMIN_PASSWORD" mywishlist:v3
```

If you already have a container named `mywishlist-v3`, remove that test container before running the command again:

```powershell
docker rm -f mywishlist-v3
```

Then open `http://localhost:5051/console.html` and unlock the administrator console. The Console manages site notifications, people, and backups. The sign-in token expires after eight hours or when you lock the panel/close the browser tab session.

For a production deployment, set `ADMIN_PASSWORD` as a Docker environment variable or in your deployment's protected environment configuration. Use HTTPS when accessing the site remotely.

## Announcements

- Visitors can read published updates without a password.
- Only authenticated administrators can publish, edit, or delete updates.
- Updates are stored in `public/DATA/popupdata.json`, which the server creates as needed.
- Existing item/profile data and backup handling are left in place.


## Console features

- Site notifications: create, edit, delete, and hide announcements. Visible notifications appear at the top of the homepage.
- People: add, edit, and delete profiles. These changes require the administrator token.
- Backups: create manual ZIP backups, download saved backups, restore a saved backup, or upload a ZIP backup to restore.
- The server creates `public/DATA/itemdata.js` automatically on a fresh install so the edit page can load before the first item is added.

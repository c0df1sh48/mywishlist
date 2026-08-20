const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const os = require("os");
const archiver = require("archiver");
const unzipper = require("unzipper");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5050;

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(PUBLIC_DIR, "DATA");
const IMGS_DIR = path.join(DATA_DIR, "imgs");
const BACKUPS_DIR = path.join(ROOT, "backups");
const TEMP_DIR = path.join(ROOT, "temp");

const ITEM_DATA_PATH = path.join(DATA_DIR, "itemdata.js");
const PERSON_DATA_PATH = path.join(DATA_DIR, "persondata.js");
const POPUP_DATA_PATH = path.join(DATA_DIR, "popupdata.json");

const IMAGE_FOLDERS = [
    "0-25imgs",
    "25-50imgs",
    "50-75imgs",
    "75-100imgs",
    "100-500imgs",
    "unkimgs"
];

// ─────────────────────────────────────────────────────────────────────────────
// Startup directories
// ─────────────────────────────────────────────────────────────────────────────

for (const dir of [
    PUBLIC_DIR,
    DATA_DIR,
    IMGS_DIR,
    BACKUPS_DIR,
    TEMP_DIR
]) {
    fs.mkdirSync(dir, { recursive: true });
}

for (const folder of IMAGE_FOLDERS) {
    fs.mkdirSync(path.join(IMGS_DIR, folder), { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

app.use(express.json({ limit: "2mb" }));
app.use(express.static(PUBLIC_DIR));

// ─────────────────────────────────────────────────────────────────────────────
// Safe serialized write queue
// ─────────────────────────────────────────────────────────────────────────────

let writing = false;
const writeQueue = [];

function safeWrite(writeFunction) {
    return new Promise((resolve, reject) => {
        writeQueue.push({
            writeFunction,
            resolve,
            reject
        });

        processWriteQueue();
    });
}

async function processWriteQueue() {
    if (writing || writeQueue.length === 0) {
        return;
    }

    writing = true;

    const job = writeQueue.shift();

    try {
        const result = await job.writeFunction();
        job.resolve(result);
    } catch (error) {
        job.reject(error);
    } finally {
        writing = false;
        processWriteQueue();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Atomic file writing
// ─────────────────────────────────────────────────────────────────────────────

function atomicWrite(filePath, content) {
    const tempPath = `${filePath}.tmp`;

    fs.writeFileSync(tempPath, content, "utf8");
    fs.renameSync(tempPath, filePath);

    return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data readers
// ─────────────────────────────────────────────────────────────────────────────

function extractArrayFromJS(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf8");

        const start = content.indexOf("[");
        const end = content.lastIndexOf("]");

        if (start === -1 || end === -1 || end <= start) {
            throw new Error(`Could not find array in ${filePath}`);
        }

        let json = content.substring(start, end + 1);

        json = json.replace(
            /'([^'\\]*(\\.[^'\\]*)*)'/g,
            (_, value) => JSON.stringify(value)
        );

        json = json.replace(
            /([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g,
            '$1"$2":'
        );

        return JSON.parse(json);

    } catch (error) {
        console.error(`Failed to read ${filePath}:`, error);
        return null;
    }
}

function readItems() {
    return extractArrayFromJS(ITEM_DATA_PATH);
}

function readPersons() {
    return extractArrayFromJS(PERSON_DATA_PATH);
}

function readPopups() {
    try {
        if (!fs.existsSync(POPUP_DATA_PATH)) {
            return [];
        }

        const parsed = JSON.parse(
            fs.readFileSync(POPUP_DATA_PATH, "utf8")
        );

        if (Array.isArray(parsed)) {
            return parsed;
        }

        if (
            parsed &&
            typeof parsed === "object" &&
            parsed.title !== undefined
        ) {
            return [parsed];
        }

        return [];

    } catch (error) {
        console.error("Failed to read popup data:", error);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data writers
// ─────────────────────────────────────────────────────────────────────────────

function escapeJSString(value) {
    return JSON.stringify(String(value ?? ""));
}

function writeItems(items) {
    try {
        let output = "window.WISHLIST_ITEMS = [\n";

        items.forEach((item, index) => {

            output += "  {\n";

            output += `    user: ${escapeJSString(item.user)},\n`;
            output += `    name: ${escapeJSString(item.name)},\n`;

            if (item.amount === "unk") {

                output += "    amount: 'unk',\n";

            } else {

                const amount = Number(item.amount);

                if (!Number.isFinite(amount)) {
                    throw new Error(
                        `Invalid item amount: ${item.amount}`
                    );
                }

                output += `    amount: ${amount},\n`;
            }

            output += `    bio: ${escapeJSString(item.bio)},\n`;
            output += `    longBio: ${escapeJSString(item.longBio)},\n`;

            const images =
                Array.isArray(item.images)
                    ? item.images
                    : [];

            output += `    images: ${JSON.stringify(images)},\n`;
            output += `    imgUrl: ${escapeJSString(item.imgUrl)},\n`;
            output += `    link: ${escapeJSString(item.link)}\n`;

            output +=
                index === items.length - 1
                    ? "  }\n"
                    : "  },\n";
        });

        output += "];\n";

        return atomicWrite(
            ITEM_DATA_PATH,
            output
        );

    } catch (error) {

        console.error(
            "Failed to write item data:",
            error
        );

        return false;
    }
}

function writePersons(persons) {
    try {

        let output =
            "window.PERSONS = [\n";

        persons.forEach((person, index) => {

            output += "  {\n";

            output +=
                `    username: ${escapeJSString(person.username)},\n`;

            output +=
                `    pfp: ${escapeJSString(person.pfp)}\n`;

            output +=
                index === persons.length - 1
                    ? "  }\n"
                    : "  },\n";
        });

        output += "];\n";

        return atomicWrite(
            PERSON_DATA_PATH,
            output
        );

    } catch (error) {

        console.error(
            "Failed to write person data:",
            error
        );

        return false;
    }
}

function writePopups(popups) {
    try {

        return atomicWrite(
            POPUP_DATA_PATH,
            JSON.stringify(popups, null, 2)
        );

    } catch (error) {

        console.error(
            "Failed to write popup data:",
            error
        );

        return false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image uploads
// ─────────────────────────────────────────────────────────────────────────────

const imageStorage = multer.diskStorage({

    destination: (req, file, callback) => {

        const amount = req.body.amount;

        let folder = "unkimgs";

        if (
            amount !== undefined &&
            amount !== "unk"
        ) {

            const number =
                Number.parseFloat(amount);

            if (Number.isFinite(number)) {

                if (number < 25) {

                    folder = "0-25imgs";

                } else if (number < 50) {

                    folder = "25-50imgs";

                } else if (number < 75) {

                    folder = "50-75imgs";

                } else if (number < 100) {

                    folder = "75-100imgs";

                } else {

                    folder = "100-500imgs";
                }
            }
        }

        callback(
            null,
            path.join(IMGS_DIR, folder)
        );
    },

    filename: (req, file, callback) => {

        const safeName =
            path
                .basename(file.originalname)
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );

        callback(
            null,
            `${Date.now()}-${safeName}`
        );
    }
});

const upload = multer({

    storage: imageStorage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {

        const allowed = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/avif"
        ];

        if (allowed.includes(file.mimetype)) {

            callback(null, true);

        } else {

            callback(
                new Error(
                    "Only image files are allowed"
                )
            );
        }
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// Backup upload
// ─────────────────────────────────────────────────────────────────────────────

const uploadBackup = multer({

    dest: TEMP_DIR,

    limits: {
        fileSize: 200 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {

        if (
            file.mimetype === "application/zip" ||
            file.originalname
                .toLowerCase()
                .endsWith(".zip")
        ) {

            callback(null, true);

        } else {

            callback(
                new Error(
                    "Only ZIP files are allowed"
                )
            );
        }
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ITEM API
// ─────────────────────────────────────────────────────────────────────────────

app.post("/api/add-item", async (req, res) => {

    try {

        console.log("========================================");
        console.log("➕ ADD ITEM REQUEST");
        console.log("========================================");

        console.log(
            "📦 Raw request body:",
            req.body
        );


        /*
         * Accept both formats:
         *
         * {
         *   user,
         *   name,
         *   amount,
         *   ...
         * }
         *
         * and:
         *
         * {
         *   item: {
         *      user,
         *      name,
         *      amount,
         *      ...
         *   }
         * }
         */

        const data =
            req.body?.item &&
            typeof req.body.item === "object"
                ? req.body.item
                : req.body;


        const user =
            data.user;

        const name =
            data.name;

        const amount =
            data.amount;

        const bio =
            data.bio || "";

        const longBio =
            data.longBio || "";

        const imgUrl =
            data.imgUrl || "";

        const link =
            data.link || "";

        const images =
            Array.isArray(data.images)
                ? data.images
                : [];


        console.log(
            "👤 User:",
            user
        );

        console.log(
            "📝 Name:",
            name
        );

        console.log(
            "💰 Amount:",
            amount
        );

        console.log(
            "📄 Bio:",
            bio
        );

        console.log(
            "🔗 Link:",
            link
        );

        console.log(
            "🖼️ Images:",
            images
        );


        // ─────────────────────────────────────────────
        // Validate user
        // ─────────────────────────────────────────────

        if (
            !user ||
            typeof user !== "string" ||
            !user.trim()
        ) {

            return res.status(400).json({
                error:
                    "Missing required field: user"
            });
        }


        // ─────────────────────────────────────────────
        // Validate name
        // ─────────────────────────────────────────────

        if (
            !name ||
            typeof name !== "string" ||
            !name.trim()
        ) {

            return res.status(400).json({
                error:
                    "Missing required field: name"
            });
        }


        // ─────────────────────────────────────────────
        // Validate amount
        // ─────────────────────────────────────────────

        if (
            amount === undefined ||
            amount === null ||
            amount === ""
        ) {

            return res.status(400).json({
                error:
                    "Missing required field: amount"
            });
        }


        let parsedAmount;


        if (
            amount === "unk" ||
            String(amount).toLowerCase() === "unknown"
        ) {

            parsedAmount = "unk";

        } else {

            parsedAmount =
                Number.parseFloat(amount);


            if (!Number.isFinite(parsedAmount)) {

                return res.status(400).json({
                    error:
                        "Invalid amount"
                });
            }
        }


        // ─────────────────────────────────────────────
        // Read existing items
        // ─────────────────────────────────────────────

        const items =
            readItems();


        if (items === null) {

            return res.status(500).json({
                error:
                    "Could not read item data"
            });
        }


        // ─────────────────────────────────────────────
        // Create new item
        // ─────────────────────────────────────────────

        const newItem = {

            user:
                user.trim(),

            name:
                name.trim(),

            amount:
                parsedAmount,

            bio:
                String(bio),

            longBio:
                String(longBio),

            images,

            imgUrl:
                String(imgUrl),

            link:
                String(link)

        };


        console.log(
            "📦 New item:",
            newItem
        );


        // ─────────────────────────────────────────────
        // Add item
        // ─────────────────────────────────────────────

        items.push(newItem);


        const success =
            await safeWrite(
                () => writeItems(items)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to save item"
            });
        }


        // ─────────────────────────────────────────────
        // Notify clients
        // ─────────────────────────────────────────────

        io.emit(
            "items-updated",
            {
                item: newItem
            }
        );


        console.log(
            "✅ Item added successfully!"
        );

        console.log(
            "📊 Total items:",
            items.length
        );


        res.json({

            success:
                true,

            message:
                "Item added successfully",

            item:
                newItem

        });


    } catch (error) {

        console.error(
            "❌ Add item error:",
            error
        );


        res.status(500).json({

            error:
                error.message ||
                "Server error"

        });
    }
});


app.post("/api/edit-item", async (req, res) => {

    try {

        const {
            index,
            item
        } = req.body;


        if (
            !Number.isInteger(index) ||
            index < 0
        ) {

            return res.status(400).json({
                error:
                    "Invalid item index"
            });
        }


        const items =
            readItems();


        if (items === null) {

            return res.status(500).json({
                error:
                    "Could not read item data"
            });
        }


        if (index >= items.length) {

            return res.status(404).json({
                error:
                    "Item not found"
            });
        }


        items[index] =
            item;


        const success =
            await safeWrite(
                () => writeItems(items)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to update item"
            });
        }


        io.emit(
            "items-updated"
        );


        res.json({

            success:
                true,

            message:
                "Item updated successfully"

        });

    } catch (error) {

        console.error(
            "Edit item error:",
            error
        );

        res.status(500).json({
            error:
                "Server error"
        });
    }
});


app.post("/api/delete-item", async (req, res) => {

    try {

        const {
            index
        } = req.body;


        if (
            !Number.isInteger(index) ||
            index < 0
        ) {

            return res.status(400).json({
                error:
                    "Invalid item index"
            });
        }


        const items =
            readItems();


        if (items === null) {

            return res.status(500).json({
                error:
                    "Could not read item data"
            });
        }


        if (index >= items.length) {

            return res.status(404).json({
                error:
                    "Item not found"
            });
        }


        items.splice(
            index,
            1
        );


        const success =
            await safeWrite(
                () => writeItems(items)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to delete item"
            });
        }


        io.emit(
            "items-updated"
        );


        res.json({

            success:
                true,

            message:
                "Item deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete item error:",
            error
        );


        res.status(500).json({
            error:
                "Server error"
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSON API
// ─────────────────────────────────────────────────────────────────────────────

app.post("/api/add-person", async (req, res) => {

    try {

        const {
            username,
            pfp
        } = req.body;


        if (!username) {

            return res.status(400).json({
                error:
                    "Missing required field: username"
            });
        }


        const persons =
            readPersons();


        if (persons === null) {

            return res.status(500).json({
                error:
                    "Could not read person data"
            });
        }


        if (
            persons.some(
                person =>
                    person.username === username
            )
        ) {

            return res.status(400).json({
                error:
                    "Person already exists"
            });
        }


        const person = {

            username,

            pfp:
                pfp || ""

        };


        persons.push(
            person
        );


        const success =
            await safeWrite(
                () => writePersons(persons)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to save person"
            });
        }


        io.emit(
            "persons-updated",
            {
                person
            }
        );


        res.json({

            success:
                true,

            message:
                "Person added successfully",

            person

        });

    } catch (error) {

        console.error(
            "Add person error:",
            error
        );


        res.status(500).json({
            error:
                "Server error"
        });
    }
});


app.post("/api/edit-person", async (req, res) => {

    try {

        const {
            index,
            person
        } = req.body;


        if (
            !Number.isInteger(index) ||
            index < 0
        ) {

            return res.status(400).json({
                error:
                    "Invalid person index"
            });
        }


        const persons =
            readPersons();


        if (persons === null) {

            return res.status(500).json({
                error:
                    "Could not read person data"
            });
        }


        if (index >= persons.length) {

            return res.status(404).json({
                error:
                    "Person not found"
            });
        }


        persons[index] =
            person;


        const success =
            await safeWrite(
                () => writePersons(persons)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to update person"
            });
        }


        io.emit(
            "persons-updated"
        );


        res.json({

            success:
                true,

            message:
                "Person updated successfully"

        });

    } catch (error) {

        console.error(
            "Edit person error:",
            error
        );


        res.status(500).json({
            error:
                "Server error"
        });
    }
});


app.post("/api/delete-person", async (req, res) => {

    try {

        const {
            index
        } = req.body;


        if (
            !Number.isInteger(index) ||
            index < 0
        ) {

            return res.status(400).json({
                error:
                    "Invalid person index"
            });
        }


        const persons =
            readPersons();


        if (persons === null) {

            return res.status(500).json({
                error:
                    "Could not read person data"
            });
        }


        if (index >= persons.length) {

            return res.status(404).json({
                error:
                    "Person not found"
            });
        }


        persons.splice(
            index,
            1
        );


        const success =
            await safeWrite(
                () => writePersons(persons)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to delete person"
            });
        }


        io.emit(
            "persons-updated"
        );


        res.json({

            success:
                true,

            message:
                "Person deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete person error:",
            error
        );


        res.status(500).json({
            error:
                "Server error"
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE API
// ─────────────────────────────────────────────────────────────────────────────

app.post(
    "/api/upload-image",
    upload.array("images", 10),
    (req, res) => {

        try {

            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({
                    error:
                        "No files uploaded"
                });
            }


            const paths =
                req.files.map(file => {

                    const folder =
                        path.basename(
                            path.dirname(
                                file.path
                            )
                        );


                    return `DATA/imgs/${folder}/${file.filename}`;
                });


            res.json({

                success:
                    true,

                paths,

                count:
                    paths.length

            });

        } catch (error) {

            console.error(
                "Image upload error:",
                error
            );


            res.status(500).json({
                error:
                    error.message
            });
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// POPUP API
// ─────────────────────────────────────────────────────────────────────────────

function validatePopup(body) {

    const {
        type,
        title,
        message,
        enabled
    } = body;


    if (
        ![
            "info",
            "note",
            "warning"
        ].includes(type)
    ) {

        return null;
    }


    return {

        type,

        title:
            title || "",

        message:
            message || "",

        enabled:
            Boolean(enabled)

    };
}


app.get("/api/popup", (req, res) => {

    const popups =
        readPopups();


    if (popups === null) {

        return res.status(500).json({
            error:
                "Could not read popup data"
        });
    }


    res.json(
        popups
    );
});


app.post("/api/popup", async (req, res) => {

    try {

        const popup =
            validatePopup(
                req.body
            );


        if (!popup) {

            return res.status(400).json({
                error:
                    "Invalid popup type"
            });
        }


        const popups =
            readPopups();


        if (popups === null) {

            return res.status(500).json({
                error:
                    "Could not read popup data"
            });
        }


        popups.push(
            popup
        );


        const success =
            await safeWrite(
                () => writePopups(popups)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to save popup"
            });
        }


        io.emit(
            "popup-updated",
            popups
        );


        res.json({

            success:
                true,

            index:
                popups.length - 1,

            popup

        });

    } catch (error) {

        console.error(
            "Add popup error:",
            error
        );


        res.status(500).json({
            error:
                "Server error"
        });
    }
});


app.put("/api/popup/:index", async (req, res) => {

    try {

        const index =
            Number.parseInt(
                req.params.index,
                10
            );


        const popup =
            validatePopup(
                req.body
            );


        if (!popup) {

            return res.status(400).json({
                error:
                    "Invalid popup type"
            });
        }


        const popups =
            readPopups();


        if (popups === null) {

            return res.status(500).json({
                error:
                    "Could not read popup data"
            });
        }


        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= popups.length
        ) {

            return res.status(404).json({
                error:
                    "Popup not found"
            });
        }


        popups[index] =
            popup;


        const success =
            await safeWrite(
                () => writePopups(popups)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to update popup"
            });
        }


        io.emit(
            "popup-updated",
            popups
        );


        res.json({

            success:
                true,

            popup

        });

    } catch (error) {

        console.error(
            "Edit popup error:",
            error
        );


        res.status(500).json({
            error:
                "Server error"
        });
    }
});


app.delete("/api/popup/:index", async (req, res) => {

    try {

        const index =
            Number.parseInt(
                req.params.index,
                10
            );


        const popups =
            readPopups();


        if (popups === null) {

            return res.status(500).json({
                error:
                    "Could not read popup data"
            });
        }


        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= popups.length
        ) {

            return res.status(404).json({
                error:
                    "Popup not found"
            });
        }


        popups.splice(
            index,
            1
        );


        const success =
            await safeWrite(
                () => writePopups(popups)
            );


        if (!success) {

            return res.status(500).json({
                error:
                    "Failed to delete popup"
            });
        }


        io.emit(
            "popup-updated",
            popups
        );


        res.json({
            success:
                true
        });

    } catch (error) {

        console.error(
            "Delete popup error:",
            error
        );


        res.status(500).json({
            error:
                "Server error"
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP CREATION
// ─────────────────────────────────────────────────────────────────────────────

function createBackup(prefix = "backup") {

    return new Promise(
        (resolve, reject) => {

            fs.mkdirSync(
                BACKUPS_DIR,
                {
                    recursive:
                        true
                }
            );


            const timestamp =
                new Date()
                    .toISOString()
                    .replace(
                        /[:.]/g,
                        "-"
                    );


            const filename =
                `${prefix}-${timestamp}.zip`;


            const backupPath =
                path.join(
                    BACKUPS_DIR,
                    filename
                );


            const output =
                fs.createWriteStream(
                    backupPath
                );


            const archive =
                archiver(
                    "zip",
                    {
                        zlib: {
                            level:
                                prefix === "auto-backup"
                                    ? 6
                                    : 9
                        }
                    }
                );


            output.on(
                "close",
                () => {

                    resolve({

                        filename,

                        path:
                            backupPath,

                        bytes:
                            archive.pointer()

                    });

                }
            );


            output.on(
                "error",
                reject
            );


            archive.on(
                "error",
                reject
            );


            archive.pipe(
                output
            );


            archive.directory(
                DATA_DIR,
                "DATA"
            );


            archive.finalize();

        }
    );
}


async function autoBackup() {

    try {

        const result =
            await createBackup(
                "auto-backup"
            );


        console.log(
            `Auto backup created: ${result.filename}`
        );


        const backups =
            fs.readdirSync(
                BACKUPS_DIR
            )
            .filter(
                file =>
                    file.startsWith(
                        "auto-backup-"
                    ) &&
                    file.endsWith(
                        ".zip"
                    )
            )
            .sort();


        if (backups.length > 24) {

            const old =
                backups.slice(
                    0,
                    backups.length - 24
                );


            for (
                const file
                of old
            ) {

                try {

                    fs.unlinkSync(
                        path.join(
                            BACKUPS_DIR,
                            file
                        )
                    );

                } catch {}
            }
        }

    } catch (error) {

        console.error(
            "Automatic backup failed:",
            error
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL BACKUP
// ─────────────────────────────────────────────────────────────────────────────

app.post(
    "/api/backup",
    async (req, res) => {

        try {

            const result =
                await createBackup(
                    "backup"
                );


            res.json({

                success:
                    true,

                path:
                    `backups/${result.filename}`,

                bytes:
                    result.bytes

            });

        } catch (error) {

            console.error(
                "Manual backup failed:",
                error
            );


            res.status(500).json({
                error:
                    error.message
            });
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE
// ─────────────────────────────────────────────────────────────────────────────

app.post(
    "/api/restore",
    uploadBackup.single("backup"),
    async (req, res) => {

        let tempFile = null;


        try {

            if (!req.file) {

                return res.status(400).json({
                    error:
                        "No backup uploaded"
                });
            }


            tempFile =
                req.file.path;


            const entries =
                [];


            await fs
                .createReadStream(
                    tempFile
                )
                .pipe(
                    unzipper.Parse()
                )
                .on(
                    "entry",
                    entry => {

                        entries.push(
                            entry.path
                        );

                        entry.autodrain();

                    }
                )
                .promise();


            const hasItems =
                entries.some(
                    entry =>
                        entry.endsWith(
                            "itemdata.js"
                        )
                );


            const hasPersons =
                entries.some(
                    entry =>
                        entry.endsWith(
                            "persondata.js"
                        )
                );


            if (
                !hasItems ||
                !hasPersons
            ) {

                throw new Error(
                    "Invalid backup: missing required data files"
                );
            }


            await fs
                .createReadStream(
                    tempFile
                )
                .pipe(
                    unzipper.Extract({
                        path:
                            PUBLIC_DIR
                    })
                )
                .promise();


            io.emit(
                "items-updated"
            );

            io.emit(
                "persons-updated"
            );

            io.emit(
                "popup-updated"
            );


            res.json({

                success:
                    true,

                message:
                    "Restore successful"

            });

        } catch (error) {

            console.error(
                "Restore failed:",
                error
            );


            res.status(500).json({
                error:
                    error.message
            });

        } finally {

            if (tempFile) {

                try {

                    fs.unlinkSync(
                        tempFile
                    );

                } catch {}
            }
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// SOCKET.IO
// ─────────────────────────────────────────────────────────────────────────────

io.on(
    "connection",
    socket => {

        console.log(
            `Client connected: ${socket.id}`
        );


        socket.on(
            "button-pressed",
            data => {

                console.log(
                    "Button pressed:",
                    data
                );

            }
        );


        socket.on(
            "disconnect",
            () => {

                console.log(
                    `Client disconnected: ${socket.id}`
                );

            }
        );

    }
);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────

app.use(
    (error, req, res, next) => {

        console.error(
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );
        }


        res.status(400).json({

            error:
                error.message ||
                "Server error"

        });

    }
);

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────

server.listen(
    PORT,
    () => {

        let localIP =
            "localhost";


        const interfaces =
            os.networkInterfaces();


        for (
            const entries
            of Object.values(
                interfaces
            )
        ) {

            for (
                const iface
                of entries || []
            ) {

                if (
                    iface.family === "IPv4" &&
                    !iface.internal
                ) {

                    localIP =
                        iface.address;

                    break;
                }
            }
        }


        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "       MyWishlist V2"
        );

        console.log(
            "================================="
        );

        console.log(
            `Local:   http://localhost:${PORT}`
        );

        console.log(
            `Network: http://${localIP}:${PORT}`
        );

        console.log(
            "================================="
        );

        console.log("");
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATIC BACKUP
// ─────────────────────────────────────────────────────────────────────────────

autoBackup();

setInterval(
    autoBackup,
    60 * 60 * 1000
);